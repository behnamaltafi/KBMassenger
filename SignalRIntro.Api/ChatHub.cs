using EasyCaching.Core;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;

namespace ChatHubs
{
    public class ChatHub : Hub
    {

        private static ConcurrentDictionary<string, UserDto> users = new ConcurrentDictionary<string, UserDto>();
        private readonly IEasyCachingProvider _cache;
        private const int EXPIREDATE = 5;
        private const string PREFIX = $"ChatHistory_";
        public ChatHub(IEasyCachingProvider cache)
        {
            _cache = cache;
        
        }

        public async Task SendVoice(string user, byte[] audioData)
        {
            await Clients.All.SendAsync("ReceiveVoice", user, audioData);
        }
        public async Task SendMessage(string message, string refId = "", string tools = "")
        {
            try
            {
                var date = DateTime.UtcNow;
                var user = GetUserInfo();
                var newMessage = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    ReferenceId = refId,
                    User = user,
                    Message = message,
                    Tools = tools,
                    Timestamp = date
                };
                AddMessageToCache(newMessage);
                await Clients.All.SendAsync("ReceiveMessage", user, newMessage);
                var onlineUsers = SetUserDto("");
                await Clients.All.SendAsync("UpdateUserList", onlineUsers);
            }
            catch (Exception ex)
            {
                var user = GetUserInfo();
                await Clients.Caller.SendAsync("ReceiveMessage", user, ex.ToString());

            }
        }
        public async Task UpdateMessage(Guid messageId, string message = "", string tools = "")
        {
            var user = GetUserInfo();
            var oldMessage = _cache.Get<ChatMessage>(PREFIX + messageId).Value;
            var chatMessage = new ChatMessage
            {
                Id = oldMessage.Id,
                User = user,
                Message = message,
                Tools = tools,
                Timestamp = oldMessage.Timestamp
            };
            UpdateMessageInCache(messageId, chatMessage);
            
            await Clients.All.SendAsync("ReceiveMessageHistoryById", chatMessage);


        }
        public async Task UpdateTools(Guid messageId, string tools = "")
        {

            var date = DateTime.UtcNow;
            var message = _cache.Get<ChatMessage>(PREFIX + messageId).Value;

            var chatMessage = new ChatMessage
            {
                Id = message.Id,
                User = message.User,
                Message = message.Message,
                Tools = tools,
                Timestamp = message.Timestamp
            };
            UpdateMessageInCache(messageId, chatMessage);
           
            await Clients.All.SendAsync("ReceiveMessageHistoryById", chatMessage);


        }

        private void UpdateMessageInCache(Guid messageId, ChatMessage chatMessage)
        {

            var cacheKey = PREFIX + messageId;
            _cache.Remove(cacheKey);
            _cache.Set(cacheKey, chatMessage, TimeSpan.FromDays(EXPIREDATE));

        }
        private void AddMessageToCache(ChatMessage message)
        {

            var cacheKey = PREFIX + message.Id;
            _cache.Set(cacheKey, message, TimeSpan.FromDays(EXPIREDATE));

        }
        private List<ChatMessage> GetMessageHistoryFromCache(int count)
        {

            if (_cache.GetAllKeysByPrefix(PREFIX).Any())
            {
                return _cache.GetByPrefix<ChatMessage>(PREFIX).Values.Select(x => x.Value).OrderByDescending(m => m.Timestamp).Take(count).ToList();
            }
            return new List<ChatMessage>();
        }

        public async Task UpdateStatus(string @event)
        {
            var onlineUsers = SetUserDto(@event);
            await Clients.All.SendAsync("UpdateUserList", onlineUsers);

        }
        public async Task UpdateConfigs(string config)
        {

            var user = GetUserInfo();

            user.Config = config;

            users.AddOrUpdate(
                                key: user.UserId,
                                addValue: new UserDto
                                {
                                    User = user,
                                    Event = "",
                                    Status = "Online"

                                },
                                updateValueFactory: (key, existingValue) =>
                                {
                                    existingValue.User = user;
                                    existingValue.Event = "";
                                    existingValue.Status = "Online";
                                    return existingValue;
                                }
                            );



            await Clients.Caller.SendAsync("Profile", user);
            var onlineUsers = SetUserDto("");
            await Clients.All.SendAsync("UpdateUserList", onlineUsers);


        }

        public async Task GetMessageHistory(int count)
        {
            var messageHistory = GetMessageHistoryFromCache(count);
            await Clients.Caller.SendAsync("ReceiveMessageHistory", messageHistory);
        }

        private User GetUserInfo()
        {
            var token = Context.GetHttpContext().Request.Query["token"].ToString();
            var handler = new JwtSecurityTokenHandler();

            var jwtSecurityToken = handler.ReadJwtToken(token);
            var userId = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "userId").Value.ToString();
            return new User
            {
                UserName = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "userName").Value.ToString(),
                LastSeen = DateTime.UtcNow,
                Config = users.FirstOrDefault(x => x.Key == userId).Value != null ? users.FirstOrDefault(x => x.Key == userId).Value.User.Config : "",
                UserId = userId,
                FirstName = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "firstName").Value.ToString(),
                LastName = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "lastName").Value.ToString(),
            };

        }
        private ConcurrentDictionary<string, UserDto> SetUserDto(string @event, string status = "Online")
        {
            var user = GetUserInfo();
            user.LastSeen = DateTime.UtcNow;


            users.AddOrUpdate(
                                key: user.UserId,
                                addValue: new UserDto
                                {
                                    User = user,
                                    Event = @event,
                                    Status = status

                                },
                                updateValueFactory: (key, existingValue) =>
                                {

                                    existingValue.User = user;
                                    existingValue.Event = @event;
                                    existingValue.Status = status;
                                    return existingValue;
                                }
                            );



            return users;
        }
        public override async Task OnConnectedAsync()
        {
            var onlineUsers = SetUserDto("Joined");
            var user = GetUserInfo();

            await Clients.Caller.SendAsync("Profile", user);
            //await Clients.All.SendAsync("UpdateUserList", onlineUsers);
            var userGroups = [];
            // UserGroup
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var onlineUsers = SetUserDto("Left", "Offline");
            await Clients.All.SendAsync("UpdateUserList", onlineUsers);
            await base.OnDisconnectedAsync(exception);
        }



    }
}
using MongoDB.Driver;

public class ChatMessageService : IChatMessageService
{
    private readonly IMongoCollection<ChatMessage> _messages;

    public ChatMessageService(IMongoDatabase database)
    {
        _messages = database.GetCollection<ChatMessage>("ChatMessages");
    }

    public async Task<ChatMessage> GetMessageByIdAsync(Guid id) =>
        await _messages.Find(message => message.Id == id).FirstOrDefaultAsync();

    public async Task<IEnumerable<ChatMessage>> GetMessagesByGroupIdAsync(string groupId) =>
        await _messages.Find(message => message.GroupId == groupId).ToListAsync();

    public async Task<IEnumerable<ChatMessage>> GetMessagesByUserIdAsync(string userId) =>
        await _messages.Find(message => message.User.UserId == userId).ToListAsync();

    public async Task CreateMessageAsync(ChatMessage message) =>
        await _messages.InsertOneAsync(message);

    public async Task DeleteMessageAsync(Guid id) =>
        await _messages.DeleteOneAsync(message => message.Id == id);
}

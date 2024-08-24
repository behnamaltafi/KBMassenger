public interface IChatMessageService
{
    Task<ChatMessage> GetMessageByIdAsync(Guid id);
    Task<IEnumerable<ChatMessage>> GetMessagesByGroupIdAsync(string groupId);
    Task<IEnumerable<ChatMessage>> GetMessagesByUserIdAsync(string userId);
    Task CreateMessageAsync(ChatMessage message);
    Task DeleteMessageAsync(Guid id);
}

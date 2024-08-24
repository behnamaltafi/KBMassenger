public interface IChatMessageService
{
    Task<ChatMessage> GetMessageByIdAsync(Guid id);
    Task<IEnumerable<ChatMessage>> GetMessagesByGroupIdAsync(string groupId, int pageNumber, int pageSize);
    Task<IEnumerable<ChatMessage>> GetMessagesByUserIdAsync(string userId, int pageNumber, int pageSize);
    Task CreateMessageAsync(ChatMessage message);
    Task DeleteMessageAsync(Guid id);
}

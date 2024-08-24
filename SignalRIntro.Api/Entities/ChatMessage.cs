using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

public class ChatMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public Guid Id { get; set; }
    public string ReferenceId { get; set; }
    public string GroupId { get; set; }
    public string Message { get; set; }
    public DateTime Timestamp { get; set; }
    public User User { get; set; }
    public string Tools { get; set; }
}

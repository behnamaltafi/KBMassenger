using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

public class UserGroup
{
    public UserGroup()
    {
        Id = UserId + GroupId;
    }
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string UserId { get; set; }
    public string GroupId { get; set; }
    public DateTime Joint { get; set; }
}
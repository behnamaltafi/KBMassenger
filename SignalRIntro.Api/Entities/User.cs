using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime LastSeen { get; set; }
    public string Config { get; set; }
    public string UserName { get; set; }


}

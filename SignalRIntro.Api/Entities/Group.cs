using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

public class Group
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsPrivate { get; set; }
    public string Owner { get; set; }


}

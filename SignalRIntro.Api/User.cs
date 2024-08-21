public class User
{
    public string UserName { get; set; }
    public string UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime LastSeen { get; set; }
    public string Config { get; set; }

}
public class Group
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsPrivate { get; set; }
    public string Owner { get; set; }


}

public class UserGroup
{
    public UserGroup()
    {
        Id = UserId + GroupId;
    }
    public string Id { get; set; }
    public string UserId { get; set; }
    public string GroupId { get; set; }
    public DateTime Joint { get; set; }
}
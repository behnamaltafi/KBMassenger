public class User
{
    public string UserName { get; set; }
    public string UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime LastSeen { get; set; }
    public string Config { get; set; }
}
public class UserDto
{
    public User User { get; set; }
    public string Event {  get; set; }
    public string Status { get; set; }
}
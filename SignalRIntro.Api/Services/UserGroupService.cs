using MongoDB.Driver;

public class UserGroupService : IUserGroupService
{
    private readonly IMongoCollection<UserGroup> _userGroups;

    public UserGroupService(IMongoDatabase database)
    {
        _userGroups = database.GetCollection<UserGroup>("UserGroups");
    }

    public async Task<UserGroup> GetUserGroupByIdAsync(string id) =>
        await _userGroups.Find(userGroup => userGroup.Id == id).FirstOrDefaultAsync();

    public async Task<IEnumerable<UserGroup>> GetUserGroupsByUserIdAsync(string userId, int pageNumber, int pageSize) =>
        await _userGroups.Find(userGroup => userGroup.UserId == userId)
                         .Skip((pageNumber - 1) * pageSize)
                         .Limit(pageSize)
                         .ToListAsync();

    public async Task<IEnumerable<UserGroup>> GetUserGroupsByGroupIdAsync(string groupId, int pageNumber, int pageSize) =>
        await _userGroups.Find(userGroup => userGroup.GroupId == groupId)
                         .Skip((pageNumber - 1) * pageSize)
                         .Limit(pageSize)
                         .ToListAsync();

    public async Task AddUserToGroupAsync(UserGroup userGroup) =>
        await _userGroups.InsertOneAsync(userGroup);

    public async Task RemoveUserFromGroupAsync(string id) =>
        await _userGroups.DeleteOneAsync(userGroup => userGroup.Id == id);
}

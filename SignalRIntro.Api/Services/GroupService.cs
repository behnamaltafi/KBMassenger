using MongoDB.Driver;

public class GroupService : IGroupService
{
    private readonly IMongoCollection<Group> _groups;

    public GroupService(IMongoDatabase database)
    {
        _groups = database.GetCollection<Group>("Groups");
    }

    public async Task<Group> GetGroupByIdAsync(string groupId) =>
        await _groups.Find(group => group.Id == groupId).FirstOrDefaultAsync();

    public async Task<IEnumerable<Group>> GetGroupsAsync(int pageNumber, int pageSize) =>
        await _groups.Find(group => true)
                     .Skip((pageNumber - 1) * pageSize)
                     .Limit(pageSize)
                     .ToListAsync();

    public async Task CreateGroupAsync(Group group) =>
        await _groups.InsertOneAsync(group);

    public async Task UpdateGroupAsync(string groupId, Group updatedGroup) =>
        await _groups.ReplaceOneAsync(group => group.Id == groupId, updatedGroup);

    public async Task DeleteGroupAsync(string groupId) =>
        await _groups.DeleteOneAsync(group => group.Id == groupId);

    public async Task<IEnumerable<Group>> GetGroupsByUserAsync(string userId, int pageNumber, int pageSize) =>
        await _groups.Find(group => group.Owner == userId)
                     .Skip((pageNumber - 1) * pageSize)
                     .Limit(pageSize)
                     .ToListAsync();
}

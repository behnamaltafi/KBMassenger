public interface IGroupService
{
    Task<Group> GetGroupByIdAsync(string groupId);
    Task<IEnumerable<Group>> GetGroupsAsync(int pageNumber, int pageSize);
    Task CreateGroupAsync(Group group);
    Task UpdateGroupAsync(string groupId, Group updatedGroup);
    Task DeleteGroupAsync(string groupId);
    Task<IEnumerable<Group>> GetGroupsByUserAsync(string userId, int pageNumber, int pageSize);
}

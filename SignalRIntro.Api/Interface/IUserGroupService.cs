public interface IUserGroupService
{
    Task<UserGroup> GetUserGroupByIdAsync(string id);
    Task<IEnumerable<UserGroup>> GetUserGroupsByUserIdAsync(string userId, int pageNumber, int pageSize);
    Task<IEnumerable<UserGroup>> GetUserGroupsByGroupIdAsync(string groupId, int pageNumber, int pageSize);
    Task AddUserToGroupAsync(UserGroup userGroup);
    Task RemoveUserFromGroupAsync(string id);
}

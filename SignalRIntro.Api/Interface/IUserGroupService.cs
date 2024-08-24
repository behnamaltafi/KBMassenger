public interface IUserGroupService
{
    Task<UserGroup> GetUserGroupByIdAsync(string id);
    Task<IEnumerable<UserGroup>> GetUserGroupsByUserIdAsync(string userId);
    Task<IEnumerable<UserGroup>> GetUserGroupsByGroupIdAsync(string groupId);
    Task AddUserToGroupAsync(UserGroup userGroup);
    Task RemoveUserFromGroupAsync(string id);
}

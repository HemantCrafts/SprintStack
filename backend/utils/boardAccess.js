import mongoose from "mongoose";

/** Resolve user id from ObjectId, populated user doc, or string. */
export function resolveUserId(userRef) {
    if (!userRef) return null;
    if (typeof userRef === "string") return userRef;
    if (userRef instanceof mongoose.Types.ObjectId) return userRef.toString();
    if (userRef._id) return userRef._id.toString();
    return userRef.toString();
}

/** Mongo filter: boards the user owns or collaborates on. */
export function accessibleBoardsFilter(userId) {
    return {
        $or: [
            { createdBy: userId },
            { "collaborators.user": userId },
        ],
    };
}

export function getUserBoardRole(board, userId) {
    const uid = userId.toString();
    if (resolveUserId(board.createdBy) === uid) {
        return "OWNER";
    }

    for (const collaborator of board.collaborators || []) {
        if (resolveUserId(collaborator.user) === uid) {
            return collaborator.role === "GUEST" ? "VIEWER" : "EDITOR";
        }
    }

    return null;
}

export function canAccessBoard(board, userId) {
    return getUserBoardRole(board, userId) !== null;
}

export function canEditBoard(board, userId) {
    const role = getUserBoardRole(board, userId);
    return role === "OWNER" || role === "EDITOR";
}

export function isBoardOwner(board, userId) {
    return getUserBoardRole(board, userId) === "OWNER";
}

export function formatBoardForDashboard(board, userId) {
    const role = getUserBoardRole(board, userId);
    const createdBy = board.createdBy;

    return {
        _id: board._id,
        title: board.title,
        description: board.description ?? "",
        updatedAt: board.updatedAt,
        isShared: role !== "OWNER",
        membershipRole: role,
        ownerUsername: typeof createdBy === "object" ? createdBy?.username : null,
    };
}

export function buildBoardAccess(board, userId) {
    const role = getUserBoardRole(board, userId);
    return {
        role,
        canEdit: role === "OWNER" || role === "EDITOR",
        isOwner: role === "OWNER",
    };
}

export const createDocument = /* GraphQL */ `
  mutation CreateDocument(
    $id: ID!
    $title: String!
    $language: String!
    $ownerId: String!
  ) {
    createDocument(
      id: $id
      title: $title
      language: $language
      ownerId: $ownerId
    ) {
      id
      content
      title
      language
      ownerId
      createdAt
      updatedAt
    }
  }
`;

export const updateDocument = /* GraphQL */ `
  mutation UpdateDocument(
    $id: ID!
    $content: String
    $title: String
    $language: String
  ) {
    updateDocument(
      id: $id
      content: $content
      title: $title
      language: $language
    ) {
      id
      content
      title
      language
      ownerId
      createdAt
      updatedAt
    }
  }
`;

export const deleteDocument = /* GraphQL */ `
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      id
    }
  }
`;

export const joinSession = /* GraphQL */ `
  mutation JoinSession(
    $documentId: ID!
    $userId: String!
    $email: String!
    $displayName: String!
    $avatarColor: String!
  ) {
    joinSession(
      documentId: $documentId
      userId: $userId
      email: $email
      displayName: $displayName
      avatarColor: $avatarColor
    ) {
      documentId
      activeUsers {
        userId
        email
        displayName
        avatarColor
      }
    }
  }
`;

export const leaveSession = /* GraphQL */ `
  mutation LeaveSession($documentId: ID!, $userId: String!) {
    leaveSession(documentId: $documentId, userId: $userId) {
      documentId
      activeUsers {
        userId
        email
        displayName
        avatarColor
      }
    }
  }
`;

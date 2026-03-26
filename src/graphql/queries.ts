export const getDocument = /* GraphQL */ `
  query GetDocument($id: ID!) {
    getDocument(id: $id) {
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

export const listDocuments = /* GraphQL */ `
  query ListDocuments {
    listDocuments {
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

export const getSessionUsers = /* GraphQL */ `
  query GetSessionUsers($documentId: ID!) {
    getSessionUsers(documentId: $documentId) {
      activeUsers {
        userId
        email
        displayName
        avatarColor
      }
    }
  }
`;

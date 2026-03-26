export const onUpdateDocument = /* GraphQL */ `
  subscription OnUpdateDocument($id: ID!) {
    onUpdateDocument(id: $id) {
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

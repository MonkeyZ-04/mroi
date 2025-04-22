export const FACE_COMPARISION = `
  query FaceComparision(
    $image_base64: String!
    $limit: Int!
    $threshold: Float!
    $bucket_id: String!
  ) {
    fetchFaceComparisons(
      image_base64: $image_base64
      limit: $limit
      threshold: $threshold
      bucket_id: $bucket_id
    ) {
      faces {
        face_image
        feature_id
        threshold
      }
    }
  }
`;

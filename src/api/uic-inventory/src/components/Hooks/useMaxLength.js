export const useMaxLength = ({ value, limit }) => {
  return {
    limit,
    remaining: limit - (value?.length || 0),
  };
};

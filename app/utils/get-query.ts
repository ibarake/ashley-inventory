
type QueryData = {
    query: string;
  };
  

export default function getMutationType(data: QueryData): string | null {
    const query = data.query;

    // Regular expression to match the mutation pattern
    const mutationPattern = /mutation\s+(\w+)/;
    const matches = query.match(mutationPattern);

    if (matches && matches.length > 1) {
        // Return the name of the mutation
        return matches[1].replace(/\s/g, '');
    }

    return null;
}
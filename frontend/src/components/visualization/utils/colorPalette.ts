// Extended color palette for visualization
export const colorPalette = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', 
  '#00ffff', '#ff0000', '#0000ff', '#ffff00', '#ff8000', '#8000ff',
  '#00ff80', '#ff0080', '#80ff00', '#0080ff', '#ff8080', '#80ff80',
  '#8080ff', '#ffff80', '#ff80ff', '#80ffff', '#c0c0c0', '#800000'
];

export const getColor = (index: number): string => {
  return colorPalette[index % colorPalette.length];
};
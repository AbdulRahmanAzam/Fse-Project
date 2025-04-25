const randomColors = [
  ['#FF6B6B', '#4ECDC4'],
  ['#45B7D1', '#96C93D'],
  ['#FF9F43', '#FF6B6B'],
  ['#4ECDC4', '#45B7D1'],
  ['#96C93D', '#FF9F43'],
  ['#FF6B6B', '#4ECDC4'],
];

export const getRandomColor = (index?: number): [string, string] => {
  if (index !== undefined && index >= 0 && index < randomColors.length) {
    return randomColors[index] as [string, string];
  }
  const randomIdx = Math.floor(Math.random() * randomColors.length);
  return randomColors[randomIdx] as [string, string];
};

export const getCommunityColor = (communityId: string, colorIndex?: number): [string, string] => {
  const storedColors = sessionStorage.getItem('communityColors');
  const colorsMap = storedColors ? JSON.parse(storedColors) : {};

  if (colorsMap[communityId]) {
    return colorsMap[communityId];
  }

  const newColors = getRandomColor(colorIndex);
  
  colorsMap[communityId] = newColors;
  sessionStorage.setItem('communityColors', JSON.stringify(colorsMap));

  return newColors;
};

export const clearCommunityColors = () => {
  sessionStorage.removeItem('communityColors');
};


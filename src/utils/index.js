export const getMatchesWhichAdd = (actualMatches, googleMatches) => {
  try {
    const ownersActualMatch = googleMatches.map((item) => item.owner); // change on actualmatches

    const filteredMatches = actualMatches.filter((match) => {
      return !ownersActualMatch.includes(match.owner);
    });

    return filteredMatches;
  } catch (error) {
    console.log("Error", error);

    return [];
  }
};

export const addMatches = async (actualMatches, googleMatches, googleSheet) => {
  const matchesWhichAdd = getMatchesWhichAdd(actualMatches, googleMatches);
  const isAddMatches = matchesWhichAdd.length;

  if (!isAddMatches) {
    console.log("isAddMatches========>", 22222222);
    return;
  }

  await googleSheet.addRows(matchesWhichAdd);
};

export const getYesterdayDate = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1); // Уменьшаем текущую дату на 1 день

  // Форматируем дату в виде 'ДД.ММ'
  let day = String(yesterday.getDate()).padStart(2, "0");
  let month = String(yesterday.getMonth() + 1).padStart(2, "0"); // Месяцы считаются с нуля
  return `${day}.${month}`;
};

export const filterByYesterdaysDate = (arr) => {
  const yesterday = getYesterdayDate(); // Получаем вчерашнюю дату
  return arr.filter((item) => item.date === yesterday);
};

export const sleep = async (timer) =>
  await new Promise((res) => setTimeout(res, timer));

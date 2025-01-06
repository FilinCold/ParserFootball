export const addMatches = async (items, googleSheet) => {
  await googleSheet.addRows(items);
};

export const isCheckAddMatches = (actualMatches, googleMatches) => {
  const arr = [
    ...googleMatches,

    {
      time: "19:00",
      date: "05.01",
      owner: "Пирамидс1111",
      guest: "Эсперанс",
      forecast: "П1",
      coefficient: 2.025,
      check: 500,
      link: "https://nb-bet.com/Events/1338572-piramids-esperans-prognoz-na-match",
      result: 0,
    },
  ];

  try {
    const ownersActualMatch = arr.map((item) => item.owner); // change on actualmatches
    console.log(ownersActualMatch, 3333);

    const filteredMatches = googleMatches.filter(
      (item) => !ownersActualMatch.includes(item.get("owner"))
    );

    console.log(filteredMatches[0].get("owner"), 4444);

    if (!filteredMatches.length) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error, 8888);
  }
};

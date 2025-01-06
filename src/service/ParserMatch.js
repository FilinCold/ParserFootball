import puppeteer from "puppeteer";
import { MAIN_URL_FOTTBALL, SUMM_AMOUNT, SUMM_WIN_DEFAULT } from "../constants";

class ParserMatch {
  constructor() {
    this.browser = {};
    this.page = {};
  }

  formatDate = (date) => {
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Месяцы начинаются с 0
    return `${day}.${month}`;
  };

  // Функция для обработки входного слова "сегодня" или "завтра"
  convertWordToDate = (word) => {
    let result;

    switch (word.toLowerCase()) {
      case "сегодня": {
        result = new Date(); // Сегодняшняя дата

        break;
      }
      case "завтра": {
        result = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // Завтрашняя дата

        break;
      }
      default: {
        return word;
      }
    }

    return this.formatDate(result);
  };

  convertStrWordDate = (arr) => {
    return arr?.reduce((prevVal, curVal) => {
      const [time, date] = curVal;
      const convertDateStrInDate = this.convertWordToDate(date);

      prevVal.push([time, convertDateStrInDate]);

      return prevVal;
    }, []);

    // была в конце удобно было удалять из таблицы
  };

  setConfigBrowser = async (page) => {
    await this.page?.setViewport({ width: 1080, height: 1024 });
    await this.page?.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
  };

  makeChunks = (arr, chunkSize = 2) => {
    const copyArr = [...arr];
    const arrChunks = [];

    for (let i = 0; i < copyArr.length; i += chunkSize) {
      const chunk = copyArr.slice(i, i + chunkSize);
      arrChunks.push(chunk);
    }

    return arrChunks;
  };

  concatUrl = (rawUrls) => {
    return rawUrls?.reduce((prevVal, curVal) => {
      const clearUrl = curVal.slice(1); // удаляем первый символ / для склеивания с основным урлом
      prevVal.push(`${MAIN_URL_FOTTBALL}${clearUrl}`);

      return prevVal;
    }, []);
  };

  clearSomeSymbolRegex = (arr) => {
    const regex = /\d+\.\d+/g;
    const numbers = [];

    arr.forEach((str) => {
      const matches = str.match(/\d+\.\d+/g);
      if (matches) {
        numbers.push(...matches.map(Number));
      }
    });

    return this.makeChunks(numbers, 2);
  };

  createCovertMatchesForecast = (dataMatches) => {
    const {
      urls = [],
      dates = [],
      commands = [],
      coeff = [],
      winners = [],
    } = dataMatches;
    const arrMatches = [];

    for (let i = 0; i < urls.length; i++) {
      const [timeMatch, dateMatch] = dates[i];
      const [firstCommand, secondCommand] = commands[i];
      const [_, secondCoeff] = coeff[i];
      const win = winners[i];
      const url = urls[i];
      const match = {
        time: timeMatch,
        date: dateMatch,
        owner: firstCommand,
        guest: secondCommand,
        forecast: win,
        coefficient: secondCoeff,
        check: SUMM_AMOUNT,
        link: url,
        result: SUMM_WIN_DEFAULT,
      };
      arrMatches.push(match);
    }

    return arrMatches.sort((a, b) => (a.date < b.date ? 1 : -1));
  };

  parseMatches = async () => {
    await this._initPuppeter();
    await this.page?.goto?.(MAIN_URL_FOTTBALL, {
      waitUntil: "domcontentloaded",
    });

    const rawUrlMatches = await this.page?.evaluate?.(() => {
      return Array.from(
        document.querySelectorAll("div.sc-c7273f60-6 > a[href]"),
        (a) => a.getAttribute("href")
      );
    });

    const rawDateMatches = await this.page?.evaluate?.(() => {
      return Array.from(
        document.querySelectorAll("div.sc-c7273f60-0 > div"),
        (a) => a.innerHTML
      );
    });

    const rawCommandMatches = await this.page?.evaluate?.(() => {
      return Array.from(
        document.querySelectorAll("div.sc-c7273f60-3 > div"),
        (a) => a.innerHTML
      );
    });

    const rawCoeffMatches = await this.page?.evaluate?.(() => {
      return Array.from(
        document.querySelectorAll("div.sc-d83ff2c2-0 > span:nth-child(1)"),
        (a) => a.innerHTML
      );
    });

    const rawWinnerMatches = await this.page?.evaluate?.(() => {
      return Array.from(
        document.querySelectorAll("div.sc-d83ff2c2-1 > div:nth-child(1)"),
        (a) => a.innerHTML
      );
    });

    const urlMatches = this.concatUrl(rawUrlMatches);
    const dateMatchesChunk = this.convertStrWordDate(
      this.makeChunks(rawDateMatches)
    ); // разделяем на чанки по [[1,2]]
    const dateMatches = this.convertStrWordDate(dateMatchesChunk); // преобразовываем строки слов в даты
    const commandMatches = this.makeChunks(rawCommandMatches);
    const coeffMatches = this.clearSomeSymbolRegex(rawCoeffMatches);

    const dataMatches = {
      urls: urlMatches,
      dates: dateMatches,
      commands: commandMatches,
      coeff: coeffMatches,
      winners: rawWinnerMatches,
    };

    this.browser?.close();
    return this.createCovertMatchesForecast(dataMatches); // [{ time: '', date: '', }, ...]
  };

  get matches() {
    return this.parseMatches();
  }

  async _initPuppeter() {
    this.browser = await puppeteer?.launch({
      headless: true,
      args: [
        "--start-fullscreen", // you can also use '--start-fullscreen'
      ],
    });

    this.page = await this.browser.newPage();

    await this.setConfigBrowser();
  }

  convertGoogleRows(items = []) {
    return items.reduce((prevVal, curVal) => {
      const convertGoogleMatch = {
        time: curVal?.get("time"),
        date: curVal?.get("date"),
        owner: curVal?.get("owner"),
        guest: curVal?.get("guest"),
        forecast: curVal?.get("forecast"),
        coefficient: curVal?.get("coefficient"),
        check: curVal?.get("check"),
        link: curVal?.get("link"),
        result: curVal?.get("result"),
      };

      prevVal.push(convertGoogleMatch);

      return prevVal;
    }, []);
  }
}

export const parserMatch = new ParserMatch();

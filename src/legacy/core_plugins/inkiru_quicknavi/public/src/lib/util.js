// import { getHeatmapColors } from 'ui/vislib/components/color/heatmap_color';

const DEFUALT_GROUPS = ['ALL', 'ENGINEERING', 'DATA SCIENTISTS', 'BUSINESS', 'PRODUCT', 'OG', 'PLATFORM', 'SRM', 'TOOLS', 'WMCOM', 'WMPAY'];

const DEFAULT_MEMBERS = ['All'];

// const rgbToHex = (r, g, b) => {
//   return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
// };

const getDefaultOptions = (type) => {
  if(type === 'groups') {
    return DEFUALT_GROUPS.map((gp) => {
      return {
        label: gp,
        value: gp
      };
    });
  } else if(type === 'members') {
    return DEFAULT_MEMBERS.map((member) => {
      return {
        label: member,
        value: member
      };
    });
  }

  return [];
};

export const getOptionsFromList = (list, type) => {
  return list.reduce((rep, item) => {
    let items = [];

    if(item[type]) {
      items = item[type].split ? item[type].split(',') : item[type];
    }

    items.forEach((b) => {
      const find = rep.find((c) => {
        return c.label === b;
      });

      if(!find) {
        rep.push({
          label: b,
          value: b,
          color: '#add8e6'
        });
      }
    });

    return rep;
  }, getDefaultOptions(type));
};

export const getTagsOptions = (list) => {
  const resp = getOptionsFromList(list, 'tags');

  // return resp.map((tag, index) => {
  //   const rgb = getHeatmapColors(parseFloat(index/resp.length), 'Greens');
  //   const rgbDigits = rgb.substring(rgb.lastIndexOf("(") + 1, rgb.lastIndexOf(")"));
  //   const arr = rgbDigits.split(',');
  //
  //   // tag.color = rgbToHex(parseInt(arr[0]), parseInt(arr[1]), parseInt(arr[2]));
  //   tag.color = '#add8e6';
  //
  //   return tag;
  // });

  return resp;
};

export const strCapitalize = (str) => {
  const arr = str.split(' ');
  let res = '';

  arr.forEach((a) => {
    if(res !== '') {
      res += ' ';
    }
    res += a.charAt(0).toUpperCase() + a.slice(1);
  });
  return res;
};

export const unionBy = (arr1, arr2, key) => {
  const tmpArr = arr1;

  arr2.forEach((obj) => {
    const _find = tmpArr.find((tmpObj) => {
      return tmpObj[key] === obj[key];
    });

    if(!_find) {
      tmpArr.push(obj);
    }
  });

  return tmpArr.sort((a, b) => {
    return (a[key].toUpperCase() - b[key].toUpperCase()) > 0 ? -1 : 1;
  });
};

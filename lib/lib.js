function loadingBarSet(percentage,text='') {
  const progressBarLength = 30;

  const filledLength = Math.floor(progressBarLength * (percentage / 100));
  const emptyLength = progressBarLength - filledLength;
  const progressBar = '█'.repeat(filledLength) + ' '.repeat(emptyLength);
	

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`[${progressBar}] ${percentage}% ${text}`);

  // if (percentage >= 100) {
  //   process.stdout.write('\nLoading complete!\n');
  // }
}

function swap(json){
  var ret = {};
  for(var key in json){
    ret[json[key]] = key;
  }
  return ret;
}

		module.exports = {
			loadingBarSet,
			swap
		}
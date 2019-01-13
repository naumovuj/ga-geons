function Tools () {}

Tools.getRandomInt = function (min, max) 
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

Tools.arrayContains = function (arr, obj) 
{
    var l = arr.length;
    while (l--) 
	{
       if (arr[l] === obj) 
	   {
           return true;
       }
    }
    return false;
};

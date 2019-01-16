function Tools() {}

Tools.getRandomInt = function(minX, maxX) 
{
	return Math.floor(Math.random() * (maxX - minX + 1)) + minX;
};

Tools.arrayContains = function(arr, obj) 
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

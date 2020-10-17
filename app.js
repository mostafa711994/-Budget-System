

var budgetController = (function(){

    var Expanse = function(id,description,value,percentage){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    Expanse.prototype.calPerc = function(incomes){
        if(incomes > 0){
            this.percentage = Math.round((this.value / incomes) * 100);
        }else{
            this.percentage = -1;
        }
    }
    Expanse.prototype.getperc = function(){
        return this.percentage;
    }
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var calculateTotals = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1,
    }



    return {
        addItem: function (type, des, val) {

            var ID, newItem;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expanse(ID, des, val);

            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem

        },
        deleteItem: function(type, id) {
            var ids, index;


            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },
        calcualtePercentage:function(){
          data.allItems.exp.forEach(function(cur){
              return cur.calPerc(data.totals.inc);
          });
        },
        getpercentage:function(current){
            var all = data.allItems.exp.map(function(cur){
                return cur.getperc();
            });
            return all;
        },
        calculateBudget:function(){
          //calculate total inc and exp
            calculateTotals('inc');
            calculateTotals('exp');

            // // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            // //percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }

        },

        getBudget: function(){
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage

            }
        },

        testing:function(){
            console.log(data);
        }
    };

})();


var uiController = (function(){

    var DomStrings = {
        inputType:'.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        percentagesLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    }
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    var formatNumber = function(num,type){
        var splitNum,int,dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        splitNum = num.split('.');
        int = splitNum[0];
        dec = splitNum[1];
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,3);
        }

        return (type === 'exp'? '-' : '+') + ' '+  int + '.' +dec;

    }

    return{
        getInput:function(){
            return{
                type:document.querySelector(DomStrings.inputType).value,
                description:document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            }
        },
        addListItem:function(obj,type){
            var html, newHtml, element;
            if (type === 'inc') {
                element = DomStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DomStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem:function(ID){
            var el= document.getElementById(ID);
            el.parentNode.removeChild(el);
        },
        displayDate:function(){
          var now,months,month,year;
          now = new Date();

          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          month = now.getMonth();

            year = now.getFullYear();
          document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;

        },
        changeType:function(){
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDescription + ',' +
                DomStrings.inputValue
            );
            nodeListForEach(fields,function(cur){
               cur.classList.toggle('red-focus');
            });
            document.querySelector(DomStrings.addBtn).classList.toggle('red');

        },
        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DomStrings.percentagesLabel);



            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },
        displayBudget:function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            if(obj.totalInc > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent ='---';
            }

        },

        clearFields:function(){
          var fields,fieldsArr;
          fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);
          fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current){
               current.value = "";
            });
            fieldsArr[0].focus();
        },



        getDomStrings:function(){
            return DomStrings;
        }
    }


})();

var controller = (function(budgetCtrl,uiCtrl){

    var setupListeners = function(){
        var Dom = uiCtrl.getDomStrings();

        document.querySelector(Dom.addBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(e){
            if(e.keyCode === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(Dom.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(Dom.inputType).addEventListener('change',uiCtrl.changeType);
    }
    var updatePercentages = function(){
        // calculate percentages
            budgetCtrl.calcualtePercentage();
        // read percentages from budget controller
            var percentage = budgetCtrl.getpercentage();
        // display percentages in ui
            uiCtrl.displayPercentages(percentage);
        console.log(percentage);
    }

    var updateBudget = function(){
        // calculate the budget
        budgetCtrl.calculateBudget();
        // return the budget
    var budget = budgetCtrl.getBudget();
        //display the budget on ui
        uiCtrl.displayBudget(budget);
    }

    var ctrlAddItem = function(){
        var input,newItem;
        input = uiCtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            newItem =budgetCtrl.addItem(input.type,input.description,input.value);
            uiCtrl.addListItem(newItem,input.type);
            uiCtrl.clearFields();
            updateBudget();
            updatePercentages();
        }

    }
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            uiCtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    }
    return{
        init:function(){
            console.log('it works!!!!!!!!');
            uiCtrl.displayDate();
            uiCtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1

            });

            setupListeners();
        }
    }


})(budgetController,uiController);

controller.init();

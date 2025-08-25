## Project List
%%A snapshot of the project today%%
<% LifeOS.Project.snapshot() %>

## Daily Record
%%Your Record, 每天要做的事%%
- [ ] Task1 📅 <% tp.date.now("YYYY-MM-DD") %>
- [ ] Task2 📅 <% tp.date.now("YYYY-MM-DD") %>
- [ ] Task3 📅 <% tp.date.now("YYYY-MM-DD") %>

## Habit
%%Habit will not be counted as a task%%
- [ ] Drink a glass of water after wake up
- [ ] Breakfast
- Drink water
	- [ ] +1
	- [ ] +1
	- [ ] +1
	- [ ] +1
	- [ ] +1
	- [ ] +1
- [ ] Take vitamins
- [ ] Project time statistics
- [ ] Climbing stairs

## Energy allocation
%%Today's project list, according to the time consumed, automatic statistics project time consumed percentage%%
```LifeOS
ProjectListByTime
```

## Completed today
%%List of tasks completed today, extracted from all notes%%
```LifeOS
TaskDoneListByTime
```

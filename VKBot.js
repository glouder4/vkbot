const express = require("express"); 
const mysql = require("mysql2");
const request = require('request');
const VkBot = require("node-vk-bot-api");
const Markup = require('node-vk-bot-api/lib/markup');
const easyvk = require('easyvk');
const readline = require('readline')
var app = express();
const token ='58ac7df889e082385f974bf6e3fa090876d5b17d1846d8c33abf40237b3e2eb3e82fe761f8fe079b67fd0';//b7aa395f3e3ca2fb89fc258e4d3f48964b0f8d8807e74c98d4856d91e76d80623f2941dcfab73e3daab60
let EASYVK; let EASYMANAGERVK; let EASYBOTVK; let isAuthorized = false;
let bot = new VkBot(token); let specIDs = [331658531,106541016,615435367,513757464,20904658]//me,admin
request.defaults({pool:{
    maxSockets: Infinity
}});
const connection = mysql.createConnection({
	charset:'utf8',
	host: "glouder.beget.tech",
	user: "glouder_vkbot",
	database: "glouder_vkbot",
	password: "Eryjsn567"
});
 // закрытие подключения
  connection.on('error', function(err) {
    console.log('db error', err);
    if( (err.code === 'PROTOCOL_CONNECTION_LOST')||(err.code === 'ETIMEDOUT') ) { // Connection to the MySQL server is usually
	    connection.connect(function(err){
		    if (err) {
		      return console.error("Ошибка: " + err.message);
		    }
		    else{
		    	let dateNow =new Date; //(new Date).timezoneOffset(-300);
				let nowDate = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear()+'-'+dateNow.getHours()+'-'+dateNow.getMinutes()+'-'+dateNow.getSeconds();
		      	console.log("Подключение к серверу MySQL восстановлено "+nowDate);
		    }
		});                        
    }
    else {                                      
      throw err;                                 
    }
  });

let subjectList = `
📈 Математические дисциплины:

1 Аналитическая геометрия
2 Высшая математика
3 Дискретная математика
4 Дифференциальные уравнения
5 Интегралы
6 Линейная алгебра
7 Логика
8 Математика
9 Математический анализ
10 ТФКП
11 Теория вероятностей и математическая статистика
12 Уравнения математической физики

🤖 Технические дисциплины:

13 Гидравлика
14 Детали машин
15 Инженерная графика
16 Компьютерная графика
17 Материаловедение
18 Метрология
19 Механика жидкостей и газов (МЖГ)
20 Начертательная геометрия
21 Основы конструирования приборов (ОКП)
22 Подъемно-транспортные машины (ПТМ)
23 Прикладная механика
24 Резание
25 Программирование
26 Сопротивление материалов
27 Теоретическая механика
28 Теория конструкционных материалов (ТКМ)
29 Теория машин и механизмов (ТММ)
30 Термодинамика
31 Физика
32 Электротехника

💰 Экономические и 🍔гуманитарные дисциплины:

33 Биология
34 Бухгалтерский учет
35 Государственное и муниципальное управление
36 История
37 Криминалистика
38 Литература
39 Логистика
40 Маркетинг
41 Медицина
42 Международные отношения
43 Менеджмент
44 Обществознание
45 Педагогика
46 Право (абсолютно всё право)
47 Психология
48 Социология
49 Управление персоналом
50 Филология
51 Философия
52 Финансы
53 Химия
54 Экономика
55 Юриспруденция

⛩ Языки:

56 Английский язык
57 Латынь
58 Немецкий язык
59 Русский язык
60 Французский язык

⛹‍♂ Спорт:

61 Физкультура
62 Военная кафедра
`;
function databaseRequest(request){
	return new Promise(function (resolve,reject) {
		connection.query(request,function(err,response){
			if(err) reject(err);
			else resolve(response);
		})
	})
}
function initialise(){
	let dateNow =new Date; //(new Date).timezoneOffset(-300);
	let nowDate = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear()+'-'+dateNow.getHours()+'-'+dateNow.getMinutes()+'-'+dateNow.getSeconds();
	databaseRequest("SET SESSION wait_timeout = 604800").then(function(){
		databaseRequest("create table if not exists userList (id int,subject text,status text,typeOfWork text,Task text, photos text,docs text,paymentCheck text,deadline text,workTime text,chat int, executor int, workId int, price float,executorPrice float,executorStartPrice text,priceMarkup text, comment text,orderFinished int,sendingPaymentCheck int,paid int,userInChat int,whoIsAccepted text,whoIsDeclined text,commentFromExecutorWhenOrderIsAccepted text,askQuestion int)").then(function(){
			//databaseRequest("create table if not exists historyList (id int,subject text,status text,typeOfWork text,Task text, photos text,docs text,deadline text,chat int, executor int, workId int, price float,executorPrice int, comment text,orderFinished int)").then(function(){
				databaseRequest("create table if not exists executorList (id int,executor_id int,chat int, subject text, setpriceto int, waitto int,chatMessage text)").then(function(){
					databaseRequest("create table if not exists chatList (workId int,id int,executorId int,userChatId int, executorChatId int, resendUser bool default true,resendExecutor bool default true)").then(function(){
						databaseRequest("SHOW TABLES LIKE 'grandadmin'").then(function(response){
							if(response != ''){	
								for(let i =0; i < response.length;i++) specIDs.push(response[i].id);
							}
							console.log("Подключение к серверу MySQL установлено "+nowDate);							
						})
					})							
				})
			//})											
		})
	})		
}
initialise();

let longPollData; let Solve;
const captchaHandler = ({captcha_sid, captcha_img, resolve:solve, vk}) => {
	bot.sendMessage(331658531, `Введите капчу для картинки ${captcha_img} `);
    Solve = solve;
}

const isAdmin = (user_Id) =>{
	return new Promise(function (resolve,reject) {
		databaseRequest("select id from grandadmin where id="+user_Id).then(function(response){
			if(response != '') resolve(true);
			else reject(false);
		})
	})
}
const isExecutor = (user_Id) =>{
	return new Promise(function (resolve,reject) {
		databaseRequest("select id from executorList where id="+user_Id).then(function(response){
			if(response == '') reject("not-exist")
			else resolve(true);
		})
	})
}
const selectUser = (user_Id,isOrderFinished =0,workId='') => {
	return new Promise(function (resolve,reject) {
		isExecutor(user_Id).then(function(response){
			databaseRequest("select * from executorList where id="+user_Id).then(function(response){
				resolve(response)
			})
		}).catch(function(){
			if(workId ==''){
				databaseRequest("select * from userList where id="+user_Id+" and status!='Declined' and status !='Completed' and orderFinished="+isOrderFinished).then(function(response){
					if(response[0]!=undefined) resolve(response)
					else reject('isEmpty');
				}).catch(function(err){
					console.log(89,err);
				})
			}
			else{
				databaseRequest("select * from userList where id="+user_Id+" and status!='Declined' and status !='Completed' and workId="+workId+" and orderFinished="+isOrderFinished).then(function(response){
					if(response[0]!=undefined) resolve(response)
					else reject('isEmpty');
				}).catch(function(err){
					console.log(89,err);
				})
			}		
		})		
	})
}
const getUserList = () =>{
	return new Promise(function (resolve,reject) {
		databaseRequest("select * from userList").then(function(response){
			if(response.length != 0){
				resolve(response);
			}
			else reject('Список пользователей пуст');
		})
	})
}
const getHistoryList = () =>{
	return new Promise(function (resolve,reject) {
		databaseRequest("select * from userList where paid=1").then(function(){
			if(response != '') resolve(response);
			else reject('Список истории пуст');
		})
	})
}
const getExecutorList = (subject ='') =>{
	return new Promise(function (resolve,reject) {
		console.log(subject);
		if(subject != ''){
			databaseRequest("select * from executorList where subject like '%"+subject+"%'").then(function(response){
				if(response != '') resolve(response);
				else reject('Список исполнителей пуст');
			})
		}
	})
}
const searchByWorkId = (workId = '') =>{
	return new Promise(function (resolve,reject) {
		if(workId != ''){
			databaseRequest("select * from userList where workId="+workId).then(function(response){
				if(response != ''){
					resolve(response)
				}
				else reject('not-found')
			})
		}
		else{
			reject("workId doesn't exist");
		}
	})
}
let specSymbols = ['"','&'];
let vkSpecSymbols = ['&quot;','&amp;'];
function replaceAll(string, search, replace) {
	return new Promise(function (resolve,reject) {
		let newString = '';
		for(let i = 0; i < specSymbols.length;i++) string = string.split(vkSpecSymbols[i]).join(specSymbols[i]);
	  	resolve(string);
	})
}
//////////////////////Bot////////////////////////
function Search(user_Id,workId){
	selectUser(user_Id,1,workId).then(function(response){
		let orderDetails = response;
		if((response[0].subject == 'Нормативы')||(response[0].Task == 'Диктовка')||(response[0].Task == 'Сдать за вас')||(response[0].Task == 'Передать курьером')||(response[0].Task == 'Отработка')){
			selectUser(user_Id,1).then(function(response){
				var message = 'Поступил новый заказ\n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n ID заказа: '+orderDetails[0].workId+'\n Сдаваемый предмет: '+orderDetails[0].subject+'\n Тип работы: '+orderDetails[0].typeOfWork +'\nВид работы:'+orderDetails[0].Task+'\nДедлайн:'+orderDetails[0].deadline+'\nВремя начала работы:'+orderDetails[0].workTime+'\n Комментарий: '+orderDetails[0].comment+' \n\n Вложения: \n';
				var Photos = ''; var Docs = '';
				if( (response[0].photos != null)&&(response[0].photos != 0) ){
					for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
						Photos += (response[0].photos).split('<--->')[i]+'\n';
					}
				}	
				else Photos ='\nФото: отсутсвуют'
				if( (response[0].docs != null)&&(response[0].docs != 0) ){			
					for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
						Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
					}
				}
				else Docs = '\nДокументы: отсутсвуют';
				databaseRequest("select id from grandadmin").then(function(response){
					let adminId = response[1].id;
					databaseRequest("update userList set status='Personal',executor="+adminId).then(function(){
						bot.execute('messages.send', {
						  random_id: randomInteger(0, 18446744073709551614),
						  chat_id: 7,
						  message: message+Docs+' \n\n'+Photos,
						  keyboard: Markup.keyboard([
						  	[
						  		Markup.button('Сделать личным id:'+workId, 'positive')
						  	]							   	
						   ]).inline()
						})
					})
				})
			}).catch(function(err){
				console.log(2613,err);
			})
		}
		else {
			let WorkType = response[0].subject;
			let executors = []; let buttons = [];
			let workId = response[0].workId;
			let UserSubject = response[0].subject;
			
			getExecutorList(UserSubject).then(function(response){
				for(var i =0; i < response.length ;i++){
					if( (orderDetails[0].whoIsDeclined != null)&&(!orderDetails[0].whoIsDeclined.split(',').includes((response[i].id).toString(),0)) ) executors.push(response[i].id);
					else if(orderDetails[0].whoIsDeclined == null)  executors.push(response[i].id);
				}
				if(executors != ''){
					buttons.push(
						[
							Markup.button('Принять заказ id:'+workId, 'positive'),
							Markup.button('Получить информацию id:'+workId, 'primary')
						],
						[
							Markup.button('Отказаться id:'+workId, 'negative'),
						]
					);
					var message = 'Поступил новый заказ\n -----------------\n ID заказа: '+orderDetails[0].workId+'\n Сдаваемый предмет: '+orderDetails[0].subject+'\n Тип работы: '+orderDetails[0].typeOfWork +'\nВид работы:'+orderDetails[0].Task+'\nДедлайн:'+orderDetails[0].deadline+'\nВремя начала работы:'+orderDetails[0].workTime+'\n Комментарий: '+orderDetails[0].comment+' \n\n Вложения: \n';
					var Photos = ''; var Docs = '';
					if(orderDetails[0].photos != null){
						for(var i = 0; i < (orderDetails[0].photos).split('<--->').length;i++){
							Photos += (orderDetails[0].photos).split('<--->')[i]+'\n';
						}
					}
					if(orderDetails[0].docs != null){
						for(var i = 0; i < (orderDetails[0].docs).split('<--->').length;i++){
							Docs += ' \n'+(orderDetails[0].docs).split('<--->')[i]+'\n';
						}
					}
					bot.sendMessage(executors, message+Docs+'\n\n\n Вложения:'+Photos,null, Markup.keyboard(buttons).inline());
				}
			}).catch(function(err){
				if(err == 'Список исполнителей пуст'){
					var message = 'ВНИМАНИЕ\n\n СПИСОК ИСПОЛНИТЕЛЕЙ ПРЕДМЕТА:'+WorkType+' ПУСТ\n\nПоступил новый заказ\n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\nID заказа: '+orderDetails[0].workId+'\n Сдаваемый предмет: '+orderDetails[0].subject+'\n Тип работы: '+orderDetails[0].typeOfWork +'\nВид работы:'+orderDetails[0].Task+'\nДедлайн:'+orderDetails[0].deadline+'\nВремя начала работы:'+orderDetails[0].workTime+'\n Комментарий: '+orderDetails[0].comment+' \n\n Вложения: \n';
					var Photos = ''; var Docs = '';
					if(orderDetails[0].photos!= undefined){
						for(var i = 0; i < (orderDetails[0].photos).split('<--->').length;i++){
							Photos += (orderDetails[0].photos).split('<--->')[i]+'\n';
						}
					}
					if(orderDetails[0].docs!= undefined){
						for(var i = 0; i < (orderDetails[0].docs).split('<--->').length;i++){
							Docs += ' \n'+(orderDetails[0].docs).split('<--->')[i]+'\n';
						}
					}
					bot.execute('messages.send', {
					  random_id: randomInteger(0, 18446744073709551614),
					  chat_id: 7,
					  message: message+Docs+' \n\n'+Photos,
					  keyboard: Markup.keyboard([
					  	[
					  		Markup.button('Сделать личным id:'+workId, 'positive')
					  	]							   	
					   ]).inline()
					})
				}
				else console.log(2706,err);
			})
		}
		
	})
}
function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}
function BotReply(ctx,response = ' ',buttons = null){
	ctx.reply(response, null, buttons);
}
bot.command('начать', (ctx) => {
	console.log('message_new');
	BotReply(ctx,'Привет Наша команда готова помочь тебе с учебой. Тебе нужна помощь?', Markup.keyboard([
	[
		Markup.button('Заказать', 'positive'),
		Markup.button('В другой раз', 'negative')
	],
	[
		Markup.button('Задать вопрос', 'positive')
	],
	[
		Markup.button('Мои заказы', 'positive')
	]
	]).oneTime());
});
bot.command('Подтвердить', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest('select * from userList where id='+user_Id+" and status !='Declined' and status !='Completed' and orderFinished=0").then(function(response){
		let orderDetails = response;
		let dateNow = new Date();
		if(orderDetails[0] != undefined ){
			/*let nowDate = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear()+'-'+dateNow.getHours()+'-'+dateNow.getMinutes();
			console.log(nowDate);*/
			if( (orderDetails != '')&&(orderDetails[0].status ==  'getSuccess') ){		
				bot.execute('messages.createChat', {
				 title: orderDetails[0].workId+' '+orderDetails[0].subject,
				}).then(function(response){
					bot.execute('messages.getInviteLink', {
						peer_id: 2000000000+Number(response),
						group_id:148975156,
					}).then(function(chatLink){
						bot.execute('messages.editChat', {
							chat_id: Number(response),
							title: orderDetails[0].workId+' '+orderDetails[0].subject+' id:'+Number(response)
						}).then(function(){
							var message = 'Поступил новый заказ\n -----------------\n Клиент: https://vk.com/id'+orderDetails[0].id+'\n Сдаваемый предмет: '+orderDetails[0].subject+'\n Тип работы: '+orderDetails[0].typeOfWork +'\n Задача: '+orderDetails[0].Task+'\n Комментарий: '+orderDetails[0].comment+' \n\nВложения: ';
							var Photos = ''; var Docs = '';
							if(orderDetails[0].photos!= undefined){
								for(var i = 0; i < (orderDetails[0].photos).split('<--->').length;i++){
									Photos += (orderDetails[0].photos).split('<--->')[i]+'\n';
								}
							}
							if(orderDetails[0].docs!= undefined){
								for(var i = 0; i < (orderDetails[0].docs).split('<--->').length;i++){
									Docs += ' \n'+(orderDetails[0].docs).split('<--->')[i]+'\n';
								}
							}
							databaseRequest("insert chatList (workId,id,userChatId) values("+orderDetails[0].workId+","+orderDetails[0].id+","+Number(response)+")").then(function(){
								databaseRequest('update userList set chat = '+Number(response)+",status='InProcessing',orderFinished=1 where id="+user_Id+" and orderFinished =0").then(function(){
									EASYVK.call('messages.joinChatByInviteLink', {
										link: chatLink.link,
									}).then(function(chatJoin){
										let userChatID= chatJoin.chat_id;	
										EASYMANAGERVK.call('messages.joinChatByInviteLink', {
											link: chatLink.link,
										}).then(function(chatJoin){
											bot.execute('messages.send', {
												random_id: randomInteger(0, 18446744073709551614),
												peer_id:2000000000+Number(response),
												chat_id: Number(response),
												message: message+Docs+' \n\n'+Photos,
												group_id:148975156,
											}).then(function(response){
												BotReply(ctx,"Ваш заказ создан.\nДля поиск исполнителя присоединитесь к беседе вашей задачи\n"+chatLink.link,Markup.keyboard([
													[
														Markup.button('Главное меню', 'positive')
													]
												]))	
											}).catch(function(err){
												if(err == undefined){
													BotReply(ctx,"Ваш заказ создан.\nДля поиск исполнителя присоединитесь к беседе вашей задачи\n"+chatLink.link,Markup.keyboard([
														[
															Markup.button('Главное меню', 'positive')
														]
													]))
												}
												else console.log(323,err);
											})
										})
									})							
								}).catch(function(err){
									console.log(err);
								})
								})
							})
					}).catch(function(err){
						console.log(err);
					})
				}).catch(function(err){
					console.log(err);
				})
				/*EASYBOTVK.call('messages.createChat', {
					title: orderDetails[0].workId+' '+orderDetails[0].subject,
					group_id:148975156,
				}).then(function(userChatLink){
					let chatID = userChatLink.getFullResponse().response;
					let peerID = 2000000000+chatID;
					EASYBOTVK.call('messages.getInviteLink', {
						peer_id: peerID,
						group_id:148975156,
					}).then(function(chatLink){
						EASYBOTVK.call('messages.editChat', {
							chat_id: chatID,
							title: orderDetails[0].workId+' '+orderDetails[0].subject+' id:'+chatID
						}).then(function(){
							var message = 'Поступил новый заказ\n -----------------\n Клиент: https://vk.com/id'+orderDetails[0].id+'\n Сдаваемый предмет: '+orderDetails[0].subject+'\n Тип работы: '+orderDetails[0].typeOfWork +'\n Задача: '+orderDetails[0].Task+'\n Комментарий: '+orderDetails[0].comment+' \n\nВложения: ';
							var Photos = ''; var Docs = '';
							if(orderDetails[0].photos!= undefined){
								for(var i = 0; i < (orderDetails[0].photos).split('<--->').length;i++){
									Photos += (orderDetails[0].photos).split('<--->')[i]+'\n';
								}
							}
							if(orderDetails[0].docs!= undefined){
								for(var i = 0; i < (orderDetails[0].docs).split('<--->').length;i++){
									Docs += ' \n'+(orderDetails[0].docs).split('<--->')[i]+'\n';
								}
							}
							databaseRequest("insert chatList (workId,id,userChatId) values("+orderDetails[0].workId+","+orderDetails[0].id+","+chatID+")").then(function(){
								databaseRequest('update userList set chat = '+chatID+",status='InProcessing',orderFinished=1 where id="+user_Id+" and orderFinished =0").then(function(){						
									EASYVK.call('messages.joinChatByInviteLink', {
										link: chatLink.link,
									}).then(function(chatJoin){
										let userChatID= chatJoin.chat_id;	
										EASYMANAGERVK.call('messages.joinChatByInviteLink', {
											link: chatLink.link,
										}).then(function(chatJoin){
											bot.execute('messages.send', {
												random_id: randomInteger(0, 18446744073709551614),
												peer_id:peerID,
												chat_id: chatID,
												message: message+Docs+' \n\n'+Photos,
												group_id:148975156,
											}).then(function(){
												BotReply(ctx,"Ваш заказ создан.\nДля поиск исполнителя присоединитесь к беседе вашей задачи\n"+chatLink.link,Markup.keyboard([
													[
														Markup.button('Главное меню', 'positive')
													]
												]))	
											}).catch(function(err){
												console.log(323,err);
											})
										})					
									}).catch(function(err){
										console.log(329,err);
									})																												
								})	
							})
						}).catch(function(err){
						console.log(334,err);
					})						
					}).catch(function(err){
						console.log(336,err);
					})		
				}).catch(function(err){
					console.log(340,err);
				})	*/	
			}
			else if (orderDetails[0].status == 'WaitsComment'){		
				databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
					BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
						[
							Markup.button('Подтвердить', 'positive'),
							Markup.button('Отменить заказ', 'negative')
						],
						[
							Markup.button('Изменить заказ', 'default')
						]
					]).oneTime());
				})	
			}
			else if(orderDetails[0].status == 'setDeadline'){
				databaseRequest("update userList set status='setWorkTime' where id="+user_Id+" and status !='Declined' and status !='Completed' and orderFinished=0").then(function(){
					BotReply(ctx,'Укажите время начала работы (по Москве) по примеру: 8:30', Markup.keyboard([
						[
							Markup.button('Идет сейчас!', 'positive'),
						],
						[
							Markup.button('Не знаю','negative')
						],
						[
							Markup.button('Отменить заказ', 'negative')
						],
						[
							Markup.button('Главное меню', 'positive')
						]
					]).oneTime());
				})											
			}
			else if(orderDetails[0].status == 'selectingObject'){
				BotReply(ctx,'Введи номер предмета из списка (например: 1) или введи свой предмет (например: автоматизация процессов), если его нет в списке:\n'+subjectList, Markup.keyboard([
					[
						Markup.button('Отменить заказ', 'negative')
					],
					[
						Markup.button('Главное меню', 'positive')
					]
				]).oneTime());
			}
			else if(orderDetails[0].status == 'ObjectSelected'){
				BotReply(ctx,'Выбери тип работы', Markup.keyboard([
					[
						Markup.button('Контрольная работа/РК', 'positive'),
					],
					[
						Markup.button('Домашняя работа', 'primary'),
						Markup.button('Чертеж', 'primary'),
					],
					[
						Markup.button('Экзамен/Зачет', 'negative'),
						Markup.button('Реферат/Доклад/Отчет', 'negative')
					],
					[
						Markup.button('Лабораторная работа', 'primary'),
					],
					[
						Markup.button('Отменить заказ', 'primary'),
					]
				]).oneTime());
			}
			else{
				BotReply(ctx,'Неизвестная команда.');
			}
		}
		else{
			BotReply(ctx,'Я не понимаю тебя, попробуй выполнить предыдущее действие или написать мне повторно.');
		}
	})
})
bot.command('Заказать', (ctx) => {
	var user_Id = ctx.message.user_id;	
	selectUser(user_Id,0).then(function(response){
		let workID = response[0].workId;
		if( (response != '')&&(response[0].id != null)&&(response[0].id != 0) ){
			BotReply(ctx,'У вас уже есть активный заказ по предмету:'+response[0].subject+' с ID: '+response[0].workId+'. Создать еще?', Markup.keyboard([
				[
					Markup.button('Создать новый заказ', 'positive')
				],
				[
					Markup.button('Мои заказы', 'primary')
				]
			]).oneTime());			
		}
		else{
			databaseRequest("delete from userList where id="+user_Id+" and orderFinished=0").then(function(){
				databaseRequest("insert userList (id,subject,status,orderFinished) values("+user_Id+",'null','selectingObject',0)").then(function(){
					BotReply(ctx,'Введи номер предмета из списка (например: 1) или введи свой предмет (например: автоматизация процессов), если его нет в списке:\n'+subjectList, Markup.keyboard([
						[
							Markup.button('Главное меню', 'positive')
						]
					]).oneTime());
				})
			})			
		}
	}).catch(function(err){
		if(err == "isEmpty"){
			databaseRequest("insert userList (id,subject,status,orderFinished) values("+user_Id+",'null','selectingObject',0)").then(function(){
				BotReply(ctx,'Введи номер предмета из списка (например: 1) или введи свой предмет (например: автоматизация процессов), если его нет в списке:\n'+subjectList, Markup.keyboard([
					[
						Markup.button('Главное меню', 'positive')
					]
				]).oneTime());
			})
		}
	})
});
bot.command('Задать вопрос', (ctx) => {
	var user_Id = ctx.message.user_id;	
	databaseRequest("select * from userList where id="+user_Id+" and orderFinished=0").then(function(response){
		if(response != ''){
				databaseRequest("update userList set askQuestion=1 where id ="+ user_Id).then(function(){
					BotReply(ctx,"Вводите свои сообщения, бот не будет реагировать на ваши сообщения пока вы не нажмёте «продолжить»",Markup.keyboard([
						[
							Markup.button('Продолжить','positive')
						]
					]))
				})			
		}
		else{
			databaseRequest("insert userList (id,subject,status,orderFinished,askQuestion) values("+user_Id+",'null','selectingObject',0,1)").then(function(){
				BotReply(ctx,"Вводите свои сообщения, бот не будет реагировать на ваши сообщения пока вы не нажмёте «продолжить»",Markup.keyboard([
					[
						Markup.button('Продолжить','positive')
					]
				]))
			})
		}
	})
});
bot.command('Продолжить', (ctx) => {
	var user_Id = ctx.message.user_id;	
	databaseRequest("update userList set askQuestion=0 where id ="+ user_Id).then(function(){
		BotReply(ctx,"Вы можете продолжить заказ", Markup.keyboard([
			[
				Markup.button('Заказать', 'positive'),
				Markup.button('В другой раз', 'negative')
			],
			[
				Markup.button('Задать вопрос', 'positive')
			],
			[
				Markup.button('Мои заказы', 'positive')
			]
		]))
	}).catch(function(){
		BotReply(ctx,'Привет Наша команда готова помочь тебе с учебой. Тебе нужна помощь?', Markup.keyboard([
			[
				Markup.button('Заказать', 'positive'),
				Markup.button('В другой раз', 'negative')
			],
			[
				Markup.button('Задать вопрос', 'positive')
			],
			[
				Markup.button('Мои заказы', 'positive')
			]
		]));
	})
});
bot.command('В другой раз', (ctx) => {
	BotReply(ctx,'Если понадоблюсь - пиши.\n Мы выполняем все виды работ:\n- помощь  врежиме онлайн\n- домашние задания\n- курсовые и вкр\n-диктовка в микронаушник/skype/discord и т.д\n- все виды помощи с сессией\n- отработка физкультуры (только для МГТУ им.Н.Э. Баумана)\n- сдача номративов на военную кафедру.\n Наши отзывы: https://vk.com/app6326142_-148975156', Markup.keyboard([
		[
			Markup.button('Главное меню', 'positive')
		],
		[
			Markup.button('Задать вопрос', 'positive')
		]
	]));
});
bot.command('Другой предмет', (ctx) => {
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(){
		BotReply(ctx,'Вы не можете создать заказ являясь исполнителем.', Markup.keyboard([
			[
				Markup.button('Список заказов', 'positive')
			],
			[
				Markup.button('Главное меню', 'positive')
			]
		]).oneTime());
	}).catch(function(){
		databaseRequest("update userList set subject=0,status='selectingObject' where id="+user_Id+" and orderFinished =0").then(function(){
			BotReply(ctx,'Введи номер предмета из списка (например: 1) или введи свой предмет (например: автоматизация процессов), если его нет в списке:\n'+subjectList, Markup.keyboard([
			[
				Markup.button('Отменить заказ', 'negative')
			],
			[
				Markup.button('Главное меню', 'positive')
			]
			]).oneTime());
		})
	})
});
bot.command('Создать новый заказ', (ctx) => {
	var user_Id = ctx.message.user_id;
	selectUser(user_Id,0).then(function(response){
		if( (response[0].workId != null)&&((response[0].workId != 0)) ){
			databaseRequest("delete from userList where id="+user_Id+" and orderFinished=0").then(function(){
				databaseRequest("delete from chatList where workId="+response[0].workId).then(function(){
					databaseRequest("insert userList (id,subject,status,orderFinished) values("+user_Id+",'null','selectingObject',0)").then(function(){
						BotReply(ctx,'Введи номер предмета из списка (например: 1) или введи свой предмет (например: автоматизация процессов), если его нет в списке:\n'+subjectList, Markup.keyboard([
						[
							Markup.button('Главное меню', 'positive')
						]
						]).oneTime());
					})
				})	
			})	
		}
		else{
			databaseRequest("delete from userList where id="+user_Id+" and orderFinished=0").then(function(){
				databaseRequest("insert userList (id,subject,status,orderFinished) values("+user_Id+",'null','selectingObject',0)").then(function(){
					BotReply(ctx,'Введи номер предмета из списка (например: 1) или введи свой предмет (например: автоматизация процессов), если его нет в списке:\n'+subjectList, Markup.keyboard([
					[
						Markup.button('Главное меню', 'positive')
					]
					]).oneTime());
				})
			})	
		}
	})	
})
bot.command(['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62'], (ctx) => {
	subjects = '';
	for(let i =0; i < ctx.message.body.split(',').length;i++){
		if( ctx.message.body.split(',')[i] == '1' ) subjects += 'Аналитическая геометрия,';
		else if( ctx.message.body.split(',')[i] == '2' ) subjects += 'Высшая математика,';
		else if( ctx.message.body.split(',')[i] == '3' ) subjects += 'Дискретная математика,';
		else if( ctx.message.body.split(',')[i] == '4' ) subjects += 'Дифференциальные уравнения,';
		else if( ctx.message.body.split(',')[i] == '5' ) subjects += 'Интегралы,';
		else if( ctx.message.body.split(',')[i] == '6' ) subjects += 'Линейная алгебра,';
		else if( ctx.message.body.split(',')[i] == '7' ) subjects += 'Логика,';
		else if( ctx.message.body.split(',')[i] == '8' ) subjects += 'Математика,';
		else if( ctx.message.body.split(',')[i] == '9' ) subjects += 'Математический анализ,';
		else if( ctx.message.body.split(',')[i] == '10' ) subjects += 'ТФКП,';
		else if( ctx.message.body.split(',')[i] == '11' ) subjects += 'Теория вероятностей и математическая статистика,';
		else if( ctx.message.body.split(',')[i] == '12' ) subjects += 'Уравнения математической физики,';
		else if( ctx.message.body.split(',')[i] == '13' ) subjects += 'Гидравлика,';
		else if( ctx.message.body.split(',')[i] == '14' ) subjects += 'Детали машин,';
		else if( ctx.message.body.split(',')[i] == '15' ) subjects += 'Инженерная графика,';
		else if( ctx.message.body.split(',')[i] == '16' ) subjects += 'Компьютерная графика,';
		else if( ctx.message.body.split(',')[i] == '17' ) subjects += 'Материаловедение,';
		else if( ctx.message.body.split(',')[i] == '18' ) subjects += 'Метрология,';
		else if( ctx.message.body.split(',')[i] == '19' ) subjects += 'Механика жидкостей и газов (МЖГ),';
		else if( ctx.message.body.split(',')[i] == '20' ) subjects += 'Начертательная геометрия,';
		else if( ctx.message.body.split(',')[i] == '21' ) subjects += 'Основы конструирования приборов (ОКП),';
		else if( ctx.message.body.split(',')[i] == '22' ) subjects += 'Подъемно-транспортные машины (ПТМ),';
		else if( ctx.message.body.split(',')[i] == '23' ) subjects += 'Прикладная механика,';
		else if( ctx.message.body.split(',')[i] == '24' ) subjects += 'Резание,';
		else if( ctx.message.body.split(',')[i] == '25' ) subjects += 'Программирование,';
		else if( ctx.message.body.split(',')[i] == '26' ) subjects += 'Сопротивление материалов,';
		else if( ctx.message.body.split(',')[i] == '27' ) subjects += 'Теоретическая механика,';
		else if( ctx.message.body.split(',')[i] == '28' ) subjects += 'Теория конструкционных материалов (ТКМ),';
		else if( ctx.message.body.split(',')[i] == '29' ) subjects += 'Теория машин и механизмов (ТММ),';
		else if( ctx.message.body.split(',')[i] == '30' ) subjects += 'Термодинамика,';
		else if( ctx.message.body.split(',')[i] == '31' ) subjects += 'Физика,';
		else if( ctx.message.body.split(',')[i] == '32' ) subjects += 'Электротехника,';
		else if( ctx.message.body.split(',')[i] == '33' ) subjects += 'Биология,';
		else if( ctx.message.body.split(',')[i] == '34' ) subjects += 'Бухгалтерский учет,';
		else if( ctx.message.body.split(',')[i] == '35' ) subjects += 'Государственное и муниципальное управление,';
		else if( ctx.message.body.split(',')[i] == '36' ) subjects += 'История,';
		else if( ctx.message.body.split(',')[i] == '37' ) subjects += 'Криминалистика,';
		else if( ctx.message.body.split(',')[i] == '38' ) subjects += 'Литература,';
		else if( ctx.message.body.split(',')[i] == '39' ) subjects += 'Логистика,';
		else if( ctx.message.body.split(',')[i] == '40' ) subjects += 'Маркетинг,';
		else if( ctx.message.body.split(',')[i] == '41' ) subjects += 'Медицина,';
		else if( ctx.message.body.split(',')[i] == '42' ) subjects += 'Международные отношения,';
		else if( ctx.message.body.split(',')[i] == '43' ) subjects += 'Менеджмент,';
		else if( ctx.message.body.split(',')[i] == '44' ) subjects += 'Обществознание,';
		else if( ctx.message.body.split(',')[i] == '45' ) subjects += 'Педагогика,';
		else if( ctx.message.body.split(',')[i] == '46' ) subjects += 'Право (абсолютно всё право),';
		else if( ctx.message.body.split(',')[i] == '47' ) subjects += 'Психология,';
		else if( ctx.message.body.split(',')[i] == '48' ) subjects += 'Социология,';
		else if( ctx.message.body.split(',')[i] == '49' ) subjects += 'Управление персоналом,';
		else if( ctx.message.body.split(',')[i] == '50' ) subjects += 'Филология,';
		else if( ctx.message.body.split(',')[i] == '51' ) subjects += 'Философия,';
		else if( ctx.message.body.split(',')[i] == '52' ) subjects += 'Финансы,';
		else if( ctx.message.body.split(',')[i] == '53' ) subjects += 'Химия,';
		else if( ctx.message.body.split(',')[i] == '54' ) subjects += 'Экономика,';
		else if( ctx.message.body.split(',')[i] == '55' ) subjects += 'Юриспруденция,';
		else if( ctx.message.body.split(',')[i] == '56' ) subjects += 'Английский язык,';
		else if( ctx.message.body.split(',')[i] == '57' ) subjects += 'Латынь,';
		else if( ctx.message.body.split(',')[i] == '58' ) subjects += 'Немецкий язык,';
		else if( ctx.message.body.split(',')[i] == '59' ) subjects += 'Русский язык,';
		else if( ctx.message.body.split(',')[i] == '60' ) subjects += 'Французский язык,';
		else if( ctx.message.body.split(',')[i] == '61' ) subjects += 'Физкультура,';
		else if( ctx.message.body.split(',')[i] == '62' ) subjects += 'Военная кафедра,';
		
	}	
	subjects = subjects.substring(0, subjects.length-1);
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(response){	
		databaseRequest("select * from grandadmin where id="+user_Id).then(function(response){			
			if((response[0].setworktypeto != null)&&(response[0].setworktypeto != 0)){
				var executor = response[0].setworktypeto;
				var Subjects = '';
				databaseRequest("select subject from executorList where id="+executor).then(function(response){
					if((response[0].subject != null)&&(response[0].subject != 0))Subjects = response[0].subject;
					Subjects += subjects+',';
					databaseRequest("update executorList set subject ='"+Subjects+"' where id="+executor).then(function(){
						databaseRequest("update grandadmin set priceto =0,setworktypeto =0 where id="+user_Id).then(function(){
							BotReply(ctx,'Вы назначили https://vk.com/id'+executor+' исполнителем предмета(-ов): '+subjects, Markup.keyboard([
								[
									Markup.button('список команд', 'positive')
								]
							]).oneTime());
						})
					})
				})								
			}
			else if((response[0].getExecutorList != 0)&&((response[0].getExecutorList != null))){
				let WorkType = subjects; let executors = '';
				databaseRequest("select id from executorList where subject like '%"+WorkType+"%'").then(function(response){
					for(var j =0; j < response.length;j++){
						executors += 'https://vk.com/id'+response[j].id+'\n';
					}
					if(executors == ''){
						BotReply(ctx,'Список пуст',  Markup.keyboard([
						[
							Markup.button('список команд', 'positive')
						]
						]).oneTime())
					}
					else{
						BotReply(ctx,executors,  Markup.keyboard([
						[
							Markup.button('список команд', 'positive')
						]
						]).oneTime())
					}	
				})			
			}
			else if((response[0].priceto != 0)&&((response[0].priceto != null))){
				databaseRequest("update grandadmin set priceto =0 where id="+user_Id).then(function(){
					let workId = response[0].priceto;
					searchByWorkId(response[0].priceto).then(function(response){
						let chatID = response[0].chat;
						let peerID = 2000000000+chatID;						
						var price = ctx.message.body;
						let executorProfileID = response[0].executor;
						var message = '\n -----------------\n ID заказа: '+response[0].workId+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+' \n Вложения: \n';
						var Photos = ''; var Docs = '';
						if(response[0].photos!= null){
							for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
								Photos += (response[0].photos).split('<--->')[i]+'\n';
							}
						}
						if(response[0].docs!= null){
							for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
								Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
							}
						}
						databaseRequest("select executor_id from executorList where id="+executorProfileID).then(function(response){
								if( (response[0].executor_id != null)&&(response[0].executor_id != 0) ){
									databaseRequest("update userList set price="+price+" where workId="+workId).then(function(){
										bot.execute('messages.send', {
										  random_id: randomInteger(0, 18446744073709551614),
										  peer_id:peerID,
										  chat_id: chatID,
										  message: 'Специалист подобран:\nID исполнителя:'+response[0].executor_id+'\n Стоимость:'+price+'\nИнформация о заказе: \n'+message+Photos+'\n'+Docs,
										  keyboard: Markup.keyboard([
										  	[
										  		Markup.button('Согласиться', 'positive'),
										  		Markup.button('Отказаться', 'negative')
										  	]							   	
										   ])
										}).then(function(response){
											console.log(response);
										}).catch(function(err){
											console.log(err);
										})
										BotReply(ctx,'Информация отправлена заказчику')
									})										
								}
								else{
									BotReply(ctx,'У заказа нет исполнителя')
								}							
							})																					
					}).catch(function(err){
						if(err == 'not-found'){
							BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[0] +' не найдено.')
						}
						else if(err == "workId doesn't exist"){
							BotReply(ctx,'Не указан ID')
						}
						else{
							console.log(3531,err);
						}
					})
				})		
			}
			else{
				BotReply(ctx,'Я не понимаю тебя, укажи ответ по примеру выше или начни заново Сброс')
			}
		})
	}).catch(function(){
		isExecutor(user_Id).then(function(response){
			selectUser(user_Id).then(function(response){
				var ExecutorChat = response[0].chat; var setPrice = response[0].setpriceto; var ApproximatePrice = response[0].waitto;
				if((setPrice != null)&&(setPrice != 0)){
					databaseRequest("select * from userList where workId="+ApproximatePrice).then(function(response){					
						if( Number.isInteger(parseInt(ctx.message.body)) ){
							var workID = response[0].workId;
							var price = ctx.message.body;
							var message = '\n -----------------\n ID заказа: '+workID+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment+'\n Вложения: \n';
							var Photos = ''; var Docs = '';
							if(response[0].photos!= null){
								for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
									Photos += (response[0].photos).split('<--->')[i]+'\n';
								}
							}
							if(response[0].docs!= null){
								for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
									Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
								}
							}
							databaseRequest("update executorList set setpriceto =0 where id="+user_Id).then(function(){
								databaseRequest("update userList set executorPrice="+parseInt(price)+",status = 'PriceSelected' where workId ="+workID).then(function(){
									bot.execute('messages.send', {
									  random_id: randomInteger(0, 18446744073709551614),
									  chat_id: 4,
									  message: 'Исполнитель найден https://vk.com/id'+user_Id+'\т Цена: '+price+' \n Информация о заказе: \n'+message+Photos,
									  keyboard: Markup.keyboard( [
									  	[Markup.button('Наценка: '+ApproximatePrice+' ID:'+response[0].executor_id, 'positive')]
									  ] ).inline()
									})
									BotReply(ctx,'Информация отправлена.')
								})
							})
						}
						else{
							BotReply(ctx,'Ошибка команды. Укажите стоимость числом')
						}
					}).catch(function(err){
						BotReply(ctx,'Клиента с ID: '+(ctx.message.body).split(':')[0] +' не найдено.')
					})
				}
				else if((ApproximatePrice != null)&&(ApproximatePrice != 0)){
					databaseRequest("select * from userList where workId="+ApproximatePrice).then(function(response){					
						if( Number.isInteger(parseInt(ctx.message.body)) ){
							var workID = response[0].workId;
							var price = ctx.message.body;
							let executorStartPrice = '';
							if(response[0].executorStartPrice != null) executorStartPrice = response[0].executorStartPrice+','+price+'_'+user_Id;
							else executorStartPrice = price+'_'+user_Id;
							var message = '\n -----------------\n ID заказа: '+workID+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment+'\n Вложения: \n';
							var Photos = ''; var Docs = '';
							if(response[0].photos!= null){
								for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
									Photos += (response[0].photos).split('<--->')[i]+'\n';
								}
							}
							if(response[0].docs!= null){
								for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
									Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
								}
							}	
							databaseRequest("update executorList set waitto =0 where id="+user_Id).then(function(){
								databaseRequest("update userList set executorStartPrice ='"+executorStartPrice+"' where workId="+workID).then(function(){
									databaseRequest("select executor_id,chatMessage from executorList where id="+user_Id).then(function(response){
										bot.execute('messages.send', {
										  random_id: randomInteger(0, 18446744073709551614),
										  chat_id: 4,
										  message: 'Исполнитель найден: https://vk.com/id'+user_Id+'\nПримерная цена: '+price+'\nКомментарий исполнителя:'+response[0].chatMessage+'\n Укажите новую стоимость\n Информация о заказе: \n'+message+Photos,
										  keyboard: Markup.keyboard( [ [Markup.button('Наценка: '+ApproximatePrice+' ID:'+response[0].executor_id, 'positive')]]  ).inline()
										})
										bot.sendMessage([106541016,20904658],'Исполнитель найден: https://vk.com/id'+user_Id+'\nПримерная цена: '+price+'\nКомментарий исполнителя:'+response[0].chatMessage+'\n Укажите новую стоимость\n Информация о заказе: \n'+message+Photos,)
										BotReply(ctx,'Информация отправлена.')		
									})	
								})																				
							})
						}
						else{
							BotReply(ctx,'Ошибка команды. Укажите стоимость числом')
						}
					}).catch(function(err){
						BotReply(ctx,'Заказа с ID: '+ApproximatePrice +' не найдено.')
					})
				}
				else{
					BotReply(ctx,"С возвращением", Markup.keyboard([						
						[
							Markup.button('Мои заказы', 'positive')
						],
						[
							Markup.button('Список заказов', 'primary'),
						],
						[
							Markup.button('Открытые споры', 'negative'),
						],
					]).oneTime());
				}
			})
		}).catch(function(){
			databaseRequest("select * from userList where id="+user_Id+" and orderFinished=0").then(function(response){
				if(response != ''){
					if(response[0].status == 'setDeadline'){
						selectUser(user_Id).then(function(response){
							if( (response[0].comment !=null)&&(response[0].comment !=0) ){
								databaseRequest('update userList set deadline = "'+ctx.message.body+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){							
									databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
										BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
											[
												Markup.button('Подтвердить', 'positive'),
												Markup.button('Отменить заказ', 'negative')
											],
											[
												Markup.button('Изменить заказ', 'default')
											],
											[
												Markup.button('Главное меню', 'positive')
											]
										]).oneTime());
									})	
								}).catch(function(err){
									console.log(2158,err);
								})									
							}
							else{
								databaseRequest('update userList set deadline = "'+ctx.message.body+'" where id='+user_Id+" and orderFinished=0").then(function(){							
									BotReply(ctx,'Указать дедлайн: '+ctx.message.body+'?', Markup.keyboard([
										[
											Markup.button('Подтвердить', 'positive'),
											Markup.button('Отменить заказ', 'negative')
										],
										[
											Markup.button('Изменить заказ', 'default')
										]
									]).oneTime());
								}).catch(function(err){
									console.log(2158,err);
								})	
							}
						})								
					}
					else if(response[0].status == 'selectingObject'){
						if( (response[0].comment != null)&&(response[0].comment != 0) ){
							databaseRequest('update userList set subject = "'+subjects+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){
								databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
									BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
										[
											Markup.button('Подтвердить', 'positive'),
											Markup.button('Отменить заказ', 'negative')
										],
										[
											Markup.button('Изменить заказ', 'default')
										]
									]).oneTime());
								})	
							}).catch(function(err){
								console.log(2158,err);
							})	
						}
						else{
							console.log(subjects);
							databaseRequest('update userList set subject = "'+subjects+'", status="ObjectSelected" where id='+user_Id+" and orderFinished=0").then(function(){
								BotReply(ctx,'Выбери вид помощи', Markup.keyboard([
								[
									Markup.button('Контрольная работа/РК', 'primary'),
									Markup.button('Домашняя работа', 'primary'),
								],
								[
									Markup.button('Экзамен/Зачет', 'primary'),
									Markup.button('Курсовая работа', 'primary'),
								],
								[
									Markup.button('Реферат/Доклад/Отчет', 'primary'),
									Markup.button('Дипломная работа', 'primary')
								],
								[
									Markup.button('Лабораторная работа', 'primary'),
								],
								[
									Markup.button('Отменить заказ', 'negative')
								]
							]).oneTime());	
							}).catch(function(err){
								console.log(2158,err);
							})	
						}								
					}
					else if(response[0].status == 'setWorkTime'){
						selectUser(user_Id).then(function(response){
							if( (response[0].comment !=null)&&(response[0].comment !=0) ){
								databaseRequest('update userList set workTime = "'+ctx.message.body+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){							
									databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
										BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+ctx.message.body+'\nКомментарий:'+response[0].comment, Markup.keyboard([
											[
												Markup.button('Подтвердить', 'positive'),
												Markup.button('Отменить заказ', 'negative')
											],
											[
												Markup.button('Изменить заказ', 'default')
											]
										]).oneTime());
									})	
								}).catch(function(err){
									console.log(2158,err);
								})									
							}
							else{
								databaseRequest('update userList set workTime = "'+ctx.message.body+'", status="WaitsComment" where id='+user_Id+" and orderFinished=0").then(function(){							
									BotReply(ctx,'Опишите максимально подробно заказ, чтобы мы точно оценили работу (какие нужны номера, номер варианта, нужна ли теория и т.д.).Если у вас есть промокод, укажите его.', Markup.keyboard([
										[
											Markup.button('Отменить заказ', 'negative')
										]
									]).oneTime());
								}).catch(function(err){
									console.log(2158,err);
								})	
							}
						})								
					}
					else if(response[0].status == 'ObjectSelected'){
						BotReply(ctx,'Выбери тип работы', Markup.keyboard([
							[
								Markup.button('Контрольная работа/РК', 'positive'),
							],
							[
								Markup.button('Домашняя работа', 'primary'),
								Markup.button('Чертеж', 'primary'),
							],
							[
								Markup.button('Экзамен/Зачет', 'negative'),
							],
							[
								Markup.button('Лабораторная работа', 'primary'),
							],
							[
								Markup.button('Отменить заказ', 'negative')
							]
						]).oneTime());
					}
					else if (response[0].status == 'WaitsComment'){		
						databaseRequest("update userList set comment = '"+ctx.message.body+"',status = 'getSuccess' where id="+user_Id+" and orderFinished=0").then(function(){
							databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
								BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
									[
										Markup.button('Подтвердить', 'positive'),
										Markup.button('Отменить заказ', 'negative')
									],
									[
										Markup.button('Изменить заказ', 'default')
									]
								]).oneTime());
							})	
						})	
					}
					else if(response[0].status == 'getSuccess'){
						BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
							[
								Markup.button('Подтвердить', 'positive'),
								Markup.button('Отказаться', 'negative')
							],
							[
								Markup.button('Изменить заказ', 'default')
							]
						]).oneTime());
					}
					else{
						BotReply(ctx,'Я не понимаю тебя, укажи ответ по примеру выше или начни заново Сброс'),
						BotReply(ctx,'Подожди.. Может ты хочешь связаться с тех.поддержкой?', Markup.keyboard([
							[
								Markup.button('Связаться с тех.поддержкой', 'primary')
							],
							[
								Markup.button('Сброс', 'negative')
							]
						]).oneTime());
					}					
				}
				else{
					databaseRequest("insert userList (id,subject,status,orderFinished) values("+user_Id+",'"+subjects+"','ObjectSelected',0)").then(function(){
						BotReply(ctx,'Выбери вид помощи', Markup.keyboard([
							[
								Markup.button('Контрольная работа/РК', 'primary'),
								Markup.button('Домашняя работа', 'primary'),
							],
							[
								Markup.button('Экзамен/Зачет', 'primary'),
								Markup.button('Курсовая работа', 'primary'),
							],
							[
								Markup.button('Реферат/Доклад/Отчет', 'primary'),
								Markup.button('Дипломная работа', 'primary')
							],
							[
								Markup.button('Лабораторная работа', 'primary'),
							],
							[
								Markup.button('Отменить заказ', 'negative')
							]
						]).oneTime());	
					})
				}
			})
		})
	})
});
bot.command(['Контрольная работа/РК','Домашняя работа','Чертеж','Экзамен/Зачет','Реферат/Доклад/Отчет','Курсовая работа','Дипломная работа','Лабораторная работа'], (ctx) => {
	var user_Id = ctx.message.user_id;
	console.log(ctx.message.body);	
	databaseRequest("select status,Task from userList where id="+user_Id+" and orderFinished=0").then(function(response){
		if(response != ''){
			if(response[0].status == 'ObjectSelected'){
				let TypeOfWork = (ctx.message.body);
				if( (response[0].Task != null)&&(response[0].Task != 0) ){
					databaseRequest("update userList set typeOfWork = '"+TypeOfWork+"',status='getSuccess' where id="+user_Id+" and orderFinished=0").then(function(){
						databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
							BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
								[
									Markup.button('Подтвердить', 'positive'),
									Markup.button('Отменить заказ', 'negative')
								],
								[
									Markup.button('Изменить заказ', 'default')
								],
								[
									Markup.button('Главное меню', 'positive')
								]
							]).oneTime());
						})						
					})	
				}				
				else{
					databaseRequest("update userList set typeOfWork = '"+TypeOfWork+"',status = 'typeOfWorkSelected' where id="+user_Id+" and orderFinished=0").then(function(){
						BotReply(ctx,'Выбери вид помощи', Markup.keyboard([
							[
								Markup.button('Прислать решение', 'primary'),
								Markup.button('Передать курьером', 'primary')
							],
							[
								Markup.button('Диктовка', 'primary'),
								Markup.button('Сдать за вас', 'primary'),
							],
							[
								Markup.button('Отработка', 'primary'),
								Markup.button('Нормативы', 'primary'),
							],
							[
								Markup.button('Отменить заказ', 'negative')
							]
						]).oneTime());
					})
				}				
			}		
			else if (response[0].status == 'WaitsComment'){
				databaseRequest("update userList set comment = '"+ctx.message.body+"',status = 'getSuccess' where id="+user_Id+" and orderFinished=0").then(function(){
					databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
						BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
							[
								Markup.button('Подтвердить', 'positive'),
								Markup.button('Отменить заказ', 'negative')
							],
							[
								Markup.button('Изменить заказ', 'default')
							]
						]).oneTime());
					})	
				})	
			}	
			else if(response[0].status == 'getSuccess'){
				BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
					[
						Markup.button('Подтвердить', 'positive'),
						Markup.button('Отказаться', 'negative')
					],
					[
						Markup.button('Изменить заказ', 'default')
					]
				]).oneTime());
			}
		}
		else{
			BotReply(ctx,'Привет Наша команда готова помочь тебе с учебой. Тебе нужна помощь?', Markup.keyboard([
			[
				Markup.button('Заказать', 'positive'),
				Markup.button('В другой раз', 'negative')
			],
			[
				Markup.button('Задать вопрос', 'positive')
			],
			[
				Markup.button('Мои заказы', 'positive')
			]
			]).oneTime());
		}
	})
});
bot.command('Сменить тип работы', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest("update userList set status='ObjectSelected' where id="+user_Id+" and orderFinished=0").then(function(){
		BotReply(ctx,'Выбери тип работы', Markup.keyboard([
			[
				Markup.button('Контрольная работа/РК', 'primary'),
				Markup.button('Домашняя работа', 'primary'),
			],
			[
				Markup.button('Экзамен/Зачет', 'primary'),
				Markup.button('Курсовая работа', 'primary'),
			],
			[
				Markup.button('Реферат/Доклад/Отчет', 'primary'),
				Markup.button('Дипломная работа', 'primary')
			],
			[
				Markup.button('Лабораторная работа', 'primary'),
			],
			[
				Markup.button('Главное меню', 'positive'),
			]
		]).oneTime());
	})	
});
bot.command('Дедлайн', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest("update userList set deadline=0,status='setDeadline' where id="+user_Id+" and orderFinished =0").then(function(){
		BotReply(ctx,'Укажите дату дедлайна по примеру: 6.08. Если не знаете, то сможете в дальнейшем уведомить исполнителя.', Markup.keyboard([[
				Markup.button('Сегодня', 'primary'),
				Markup.button('Завтра', 'primary'),
			],
			[
				Markup.button('Через неделю', 'primary'),
				Markup.button('Через месяц', 'primary'),
			],
			[
				Markup.button('Другая', 'default'),
				Markup.button('Не знаю', 'default'),
			],
			[
				Markup.button('Пропустить', 'default')
			],
			[
				Markup.button('Главное меню', 'positive')
			]
		]).oneTime());
	})
})
bot.command('Изменить время', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest('update userList set workTime = 0, status="setWorkTime" where id='+user_Id+" and orderFinished=0").then(function(){							
		BotReply(ctx,'Укажите время начала работы (по Москве) по примеру: 8:30', Markup.keyboard([
			[
				Markup.button('Идет сейчас!', 'positive'),
			],
			[
				Markup.button('Не знаю','negative')
			],
			[
				Markup.button('Отменить заказ', 'negative')
			],
			[
				Markup.button('Главное меню', 'positive')
			]
		]).oneTime());	
	})
})
bot.command('Изменить комментарий', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest("update userList set comment=0,status='WaitsComment' where id="+user_Id+" and orderFinished =0").then(function(){
		BotReply(ctx,'Опишите максимально подробно заказ, чтобы мы точно оценили работу (какие нужны номера, номер варианта, нужна ли теория и т.д.).Если у вас есть промокод, укажите его.',Markup.keyboard([
			[
				Markup.button('Главное меню', 'positive')
			]
		]))
	})
})
bot.command('Изменить заказ', (ctx) => {
	BotReply(ctx,'Выбери изменение', Markup.keyboard([		
		[
			Markup.button('Другой предмет', 'primary'),
			Markup.button('Сменить тип работы', 'primary'),
		],
		[
			Markup.button('Сменить вид помощи', 'primary'),
			Markup.button('Дедлайн', 'primary'),
		],
		[
			Markup.button('Изменить время', 'primary'),
			Markup.button('Изменить комментарий', 'primary'),
		],
		[
			Markup.button('Главное меню', 'positive')
		]
	]).oneTime());
})
bot.command('Сменить вид помощи', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest("update userList set status='typeOfWorkSelected' where id="+user_Id+" and orderFinished=0").then(function(){
		BotReply(ctx,'Выбери вид помощи', Markup.keyboard([
			[
				Markup.button('Прислать решение', 'primary'),
				Markup.button('Передать курьером', 'primary')
			],
			[
				Markup.button('Диктовка', 'primary'),
				Markup.button('Сдать за вас', 'primary')
			],
			[
				Markup.button('Отработка', 'positive'),
				Markup.button('Нормативы', 'positive')
			],
			[
				Markup.button('Отменить заказ', 'negative')
			],
			[
				Markup.button('Главное меню', 'positive')
			]				
		]).oneTime())
	})	
});
bot.command('Сброс', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest("select workid from userList where id ="+user_Id+" and status !='Declined' and status !='Completed'").then(function(response){
		let workID = response[0].workId;
		databaseRequest("delete from userList where id ="+user_Id+" and status !='Declined' and status !='Completed' ").then(function(){
			databaseRequest("delete from chatList where workId="+workID).then(function(){
				BotReply(ctx,'Вы можете начать заново начать.', Markup.keyboard([
					[
						Markup.button('начать', 'positive')
					]
				]).oneTime())
			})			
		})
	})	
});
bot.command('Отменить заказ', (ctx) => {
	var user_Id = ctx.message.user_id;
	selectUser(user_Id).then(function(response){
		let workID = response[0].workId;
		databaseRequest("update userList set status='Declined',orderFinished=1 where id="+user_Id+" and orderFinished=0").then(function(){
			databaseRequest("delete from chatList where workId="+workID).then(function(){
				BotReply(ctx,'Ваш заказ отменен. Пожалуйста, укажите прчиину отмены, чтобы мы могли улучшить качество сервиса.\n Выберите вариант, либо укажите свой.',Markup.keyboard([
					[
						Markup.button('Долгий ответ', 'primary'),
						Markup.button('Разобрался сам', 'positive')
					],
					[
						Markup.button('Высокая цена', 'primary'),
						Markup.button('Вы хамло!', 'negative')
					],
					[
						Markup.button('Не доверяю', 'negative')
					],
					[
						Markup.button('Главное меню', 'positive')
					]
				]).oneTime())
			})			
		})
	}).catch(function(err){
		BotReply(ctx,'У вас нет новых заказов')	
	})	
})
bot.command(['Долгий ответ','Разобрался сам','Высокая цена','Вы хамло!','Не доверяю'], (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest("update userList set orderFinished=1,comment='"+ctx.message.body+"' where id="+user_Id+" and orderFinished=0").then(function(){
		databaseRequest("select * from userList where status='Declined' and id="+user_Id+" and orderFinished=1").then(function(response){
			var message;
			if( (response[0].executor != null)&&(response[0].executor != 0) ){
				let executor = response[0].executor;
				message = 'Клиент отказался \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\nИсполнитель: https://vk.com/id'+executor+'\nСдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Причина: '+ctx.message.body;
			}
			else if(response[0].price != null){
				message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Причина: '+ctx.message.body;
			}
			else {
				message = 'Клиент отказался \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Причина: '+ctx.message.body;
			}
			bot.execute('messages.send', {
			  random_id: randomInteger(0, 18446744073709551614),
			  chat_id: 8,
			  message: message
			})
			BotReply(ctx,'Спасибо за ваше содействие улучшению качества нашего сервиса. \n Вы всегда можете заново оформить заказ.',Markup.keyboard([
				[
					Markup.button('Главное меню', 'positive')
				]
			]))
		})		
	})
})
bot.command('Связаться с тех.поддержкой', (ctx) => {
	var user_Id = ctx.message.user_id;
	connection.query("select * from user_"+user_Id,function(err,response){
		if(err){
			if(err.sqlMessage == "Table 'vkbotdb.user_"+user_Id+"' doesn't exist"){
				connection.query("select * from executor_"+user_Id,function(err,response){
					if(err){console.log(err);}
					else{
						if(response != ''){
							bot.execute('messages.send', {
							  random_id: randomInteger(0, 18446744073709551614),
							  chat_id: 2,
							  message: ' Человеку нужна помощь https://vk.com/id'+user_Id
							}),
							BotReply(ctx,'Вы можете начать заново', Markup.keyboard([
								Markup.button('Сброс', 'negative')
							]).oneTime())
						}
					}
				});
			}
			else{
				console.log("ERROR",err);
			}
		}
		else {
			if(response != ''){
				if(response[0].workId!= undefined){
					var workid = response[0].workId;
							bot.execute('messages.send', {
							  random_id: randomInteger(0, 18446744073709551614),
							  chat_id: 2,
							  message: ' Человеку нужна помощь https://vk.com/id'+user_Id+' \n ID: '+workid
							}),
							BotReply(ctx,'Вы можете начать заново', Markup.keyboard([
								Markup.button('Сброс', 'negative')
							]).oneTime())
				}
			}
			else{
				console.log(response);
			}		
		}
	})
});
bot.command('Отказаться', (ctx) => {
	var user_Id = ctx.message.user_id;	 
	console.log('////ОТКАЗ////',ctx.message.body.split(':')[1]);
		isAdmin(user_Id).then(function(){
			if(ctx.message.body.split(':')[1]!= undefined){
				searchByWorkId(ctx.message.body.split(':')[1]).then(function(response){
					let ID = response[0].id; let WORKID = response[0].workId; let executorId = response[0].executor;
					databaseRequest("update userList set executor=0,chat=0 where workId="+WORKID).then(function(){
						databaseRequest("update chatList set executorId=0,executorChatId=0 where workId="+WORKID).then(function(){
							Search(ID,WORKID,user_Id)
							BotReply(ctx,'Заказ отправлен исполнителям');	
						})					
					})
				}).catch(function(err){
					BotReply(ctx,'Заказа с ID:'+ctx.message.body.split(':')[1]+' не найдено')	
				})
			}
		}).catch(function(){
			isExecutor(user_Id).then(function(){
				if(ctx.message.body.split(':')[1]!= undefined){
					databaseRequest("update chatList set executorId=0,executorChatId=0 where workId="+ctx.message.body.split(':')[1]).then(function(){
						searchByWorkId(ctx.message.body.split(':')[1]).then(function(response){		
							let whoIsDeclined = ''; let whoIsAccepted = response[0].whoIsAccepted;																
								if( (response[0].whoIsDeclined != null) ){
									if( response[0].whoIsDeclined.split(',').includes((user_Id).toString(),0) == false){
										whoIsDeclined += response[0].whoIsDeclined+','+user_Id;
									}		
									else{
										BotReply(ctx,'Вы ранее уже отказались от этого заказа.');				
									} 			
								}
								else whoIsDeclined += user_Id;
								
								console.log('Кто отказался');
								if( whoIsDeclined != ''){									
									databaseRequest("update userList set whoIsDeclined='"+whoIsDeclined+"' where workId="+ctx.message.body.split(':')[1]).then(function(){
										searchByWorkId(ctx.message.body.split(':')[1]).then(function(response){
											let workId = response[0].workId;
											let subject = response[0].subject;
											whoIsDeclined = response[0].whoIsDeclined;
											databaseRequest("select id from executorList where subject like '%"+subject+"%'").then(function(executorIDs){
												if( whoIsDeclined.split(',').length >= executorIDs.length ){
													databaseRequest("update userList set status='Personal' where workId="+workId).then(function(){
														var Photos = ''; var Docs = ''; let executorPrice = ''; let Executor = ''; let Price = 0; let Status = ''; let priceMarkup = 0;
														if( (response[0].photos!= null)&&(response[0].photos!= 0) ){
															for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
																Photos += (response[0].photos).split('<--->')[i]+'\n';
															}
														}
														if( (response[0].docs!= null)&&((response[0].docs!= 0)) ){
															for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
																Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
															}
														}			
														if(response[0].status == 'InProcessing'){
															Status= 'Ведется поиск исполнителя.';
														}
														else if(response[0].status == 'PriceSelected'){
															Status= 'Исполнитель указал цену.';
														}
														else if(response[0].status == 'waitToPriceResponse'){
															Status= 'Вы назначили цену. Ожидаем ответа..';
														}
														else if(response[0].status == 'Paid'){
															Status= 'Оплачен';
														}
														else if(response[0].status == 'Completed'){
															Status= 'Завершен';
														}
														else if(response[0].status == 'Declined'){
															Status= 'Отклонен';
														}
														else Status = response[0].status;			
														if((response[0].executor != null)&&(response[0].executor != 0)){
															Executor = 'Найден';
														}
														else{
															Executor = 'Отсутствует';
														}
														if((response[0].price != null)&&(response[0].price != 0)){
															Price = response[0].price;
														}
														else{
															Price = 'Не назначена';
														}
														if((response[0].executorPrice != null)&&(response[0].executorPrice != 0)){
															executorPrice = response[0].executorPrice;
														}
														else{
															executorPrice = 'Не назначена';
														}																			
														let executorStartPrice = '';
														if( (response[0].executorStartPrice != null)&&(response[0].executorStartPrice != 0) ){
															for(let i =0; i < response[0].executorStartPrice.split(',').length;i++){
																if( (response[0].executorStartPrice.split(',')[i]).split('_')[1] == response[0].executor ){
																	executorStartPrice = (response[0].executorStartPrice.split(',')[i]).split('_')[0];
																	break;
																}
															}
														}	
														else executorStartPrice	= 'Отсутствует';	
														if( (response[0].priceMarkup != null)&&(response[0].priceMarkup != 0) ){
															for(let i =0; i < response[0].priceMarkup.split(',').length;i++){
																if( (response[0].priceMarkup.split(',')[i]).split('_')[1] == response[0].executor ){
																	priceMarkup = (response[0].priceMarkup.split(',')[i]).split('_')[0];
																	break;
																}
															}
														}
														else priceMarkup = 'Отсутствует';
														message = 'Информация по заказу ID:'+workId+' \n ------------- \nИсполнитель: https://vk.com/id'+response[0].executor+'\nПредмет: '+response[0].subject+'\nНачальная цена:'+executorStartPrice+'\nЦена с наценкой:'+priceMarkup+'\n Предмет: '+response[0].subject+' \n Тип работы: '+response[0].typeOfWork+' \n Задача: '+response[0].Task +' \nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+'\n Статус: '+Status+'\n Цена: '+Price+'\n Цена исполнителя: '+executorPrice+'\n Исполнитель: '+Executor+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos;
														databaseRequest("select chat from userList where workId="+workId).then(function(response){
															if( (response[0] != undefined)&&(response[0].chat != null )&&(response[0].chat != 0) ){
																let chatID = response[0].chat;
																let peerID = 2000000000+chatID;		
																EASYBOTVK.call('messages.getInviteLink', {
																	peer_id: peerID,
																	group_id:148975156,
																}).then(function(chatLink){
																	message += '\n\n\n------------\nСсылка на беседу заказчика:\n'+chatLink.link;
																	var resultMessage = 'ВНИМАНИЕ\n\n Все исполнители отказались от заказа: '+ctx.message.body.split(':')[1]+'\n'+message;
																	bot.execute('messages.send', {
																	  random_id: randomInteger(0, 18446744073709551614),
																	  chat_id: 7,
																	  message: resultMessage,
																	  keyboard: Markup.keyboard([
																	  	[
																	  		Markup.button('Сделать личным id:'+workId, 'positive')
																	  	]							   	
																	   ]).inline()
																	})	
																	bot.sendMessage([106541016,20904658],resultMessage,Markup.keyboard([
																  	[
																  		Markup.button('Сделать личным id:'+workId, 'positive')
																  	]							   	
																   ]).inline());	
																	BotReply(ctx,'Вы отказались от заказа');
																}).catch(function(err){
																	console.log(err);
																})
															}
															else {
																var resultMessage = 'ВНИМАНИЕ\n\n Все исполнители отказались от заказа: '+ctx.message.body.split(':')[1]+'\n'+message;
																bot.execute('messages.send', {
																  random_id: randomInteger(0, 18446744073709551614),
																  chat_id: 7,
																  message: resultMessage,
																  keyboard: Markup.keyboard([
																  	[
																  		Markup.button('Сделать личным id:'+workId, 'positive')
																  	]							   	
																   ]).inline()
																})		
																bot.sendMessage([106541016,20904658],resultMessage,Markup.keyboard([
																  	[
																  		Markup.button('Сделать личным id:'+workId, 'positive')
																  	]							   	
																   ]).inline());
																BotReply(ctx,'Вы отказались от заказа')	
															}
														})	
													}).catch(function(err){ console.log(1364,err); })											
												}	
												else BotReply(ctx,'Вы отказались от заказа')									
											})
										})
									})
								}	
								if( (response[0].executor != null)&&((response[0].executor != 0)) ){
									console.log('Кто принял');
									if( whoIsAccepted != null ){ console.log('Список тех кто принял не пуст');
										if( (whoIsAccepted.split(',').includes((user_Id).toString(),0)) ||(whoIsAccepted == (user_Id).toString()) ){ console.log('Список тех кто принял содержит '+ user_Id);
											databaseRequest('select chat from userList where workId='+ctx.message.body.split(':')[1]).then(function(response){
												if( (response[0].chat != null)&&(response[0].chat != 0) ){
													let chatID = response[0].chat;
													let peerID = 2000000000+chatID;
													selectUser(user_Id).then(function(response){ console.log('ID чата '+chatID);
														if(response[0].executor_id != null){
															bot.execute('messages.send', {
															  random_id: randomInteger(0, 18446744073709551614),
															  peer_id: peerID,
															  chat_id: chatID,
															  message: 'Исполнитель с ID: '+response[0].executor_id+' отказался от исполнения вашего заказа. Выберите другого исполнителя.',
															}).then(function(response){
																//console.log(response);
															}).catch(function(err){
																//console.log(err);
															})
														}
													})												
												}
											})
										}
									}
									databaseRequest("update userList set executor=0,executorPrice=0 where workId="+ctx.message.body.split(':')[1]).then(function(){
										Search(response[0].id,ctx.message.body.split(':')[1]);
									})
								}
								BotReply(ctx,'Вы отказались от заказа. Общение из беседы более не доступно.');
						})						
					})	
				}
				else{
					console.log(1425,'Исполнитель не указан WorkID');
				}		
			}).catch(function(){
				selectUser(user_Id).then(function(response){
					if((response[0].Task == 'Диктовка')||(response[0].Task == 'Сдать за вас')||(response[0].Task == 'Передать курьером')){
						var message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork;
					}
					else if((response[0].typeOfWork == 'Лабораторная работа')||(response[0].Task == 'Отработка')||(response[0].Task == 'Нормативы')){
						var message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork;
					}
					else{
						var message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork;
					}
					if((response[0].status == 'waitToPriceResponse')||(response[0].status == 'waitToPriceResponse')){
						databaseRequest("delete from chatList where workId ="+ctx.message.body.split(':')[1]).then(function(){
							databaseRequest("delete from userList where workId ="+ctx.message.body.split(':')[1]).then(function(){
								bot.execute('messages.send', {
								  random_id: randomInteger(0, 18446744073709551614),
								  chat_id: 8,
								  message: message
								}),
								BotReply(ctx,'Ваш заказ был отменен. Вы можете начать заново.',Markup.keyboard([
									Markup.button('начать','positive')
								]))
							})
						})
					}
					else if(response[0].status == 'getSuccess'){
						databaseRequest("delete from chatList where id ="+user_Id+" and isOrderFinished = 0").then(function(){
							databaseRequest("delete from userList where id ="+user_Id+" and isOrderFinished = 0").then(function(){
								BotReply(ctx,'Ваш заказ был отменен. Вы можете начать заново.',Markup.keyboard([
									Markup.button('начать','positive')
								]))
							})
						})					
					}
				}).catch(function(err){
					BotReply(ctx,'У вас нет активных заказов')			
				});	
			})				
		})
});
bot.command('Не согласен с ценой', (ctx) => {
	var user_Id = ctx.message.user_id;
	connection.query("select * from user_"+user_Id,function(err,response){
		if(err) console.log("ERROR",err);
		else {
			if((response[0].status == 'waitToPriceResponse')||(response[0].laststatus == 'waitToPriceResponse')){
				var Executor = response[0].executor;
				if((response[0].Task == 'Диктовка')||(response[0].Task == 'Сдать за вас')||(response[0].Task == 'Передать курьером')){
					var message = 'Клиент не согласен с ценой \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Комментарий: '+response[0].comment;
				}
				else if((response[0].typeOfWork == 'Лабораторная работа')||(response[0].Task == 'Отработка')||(response[0].Task == 'Нормативы')){
					var message = 'Клиент не согласен с ценой \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Комментарий: '+response[0].comment;
				}
				else{
					var message = 'Клиент не согласен с ценой \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Комментарий: '+response[0].comment;
				}
				
				var Subject = response[0].subject;
				var Photos = ''; var Docs = '';
				if(response[0].photos != null){
					for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
						Photos += (response[0].photos).split('<--->')[i]+'\n';
					}
				}
				if(response[0].docs != null){
					for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
						Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
					}
				}				
				bot.execute('messages.send', {
				  random_id: randomInteger(0, 18446744073709551614),
				  chat_id: 8,
				  message: message+Docs+Photos,
				})
				var Chat = response[0].chat; var Price = response[0].price;
				message = 'Заказ\n -----------------\n Цена:'+response[0].price+' не устроила \n ID заказа: '+response[0].workId+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Комментарий: '+response[0].comment+' \n Вложения: ';
				connection.query("update executor_"+response[0].chat+" set chat=0",function(err,response){
					if(err) {
						if(err.sqlMessage == "Table 'vkbotdb.executor_"+Chat+"' doesn't exist"){
							connection.query("update user_"+user_Id+" set executor= 0, laststatus = status,status ='InProcessing'",function(err,response){
								if(err) console.log("ERROR",err);
								else {
									getExecutorList().then(function(response){
										var executors = [];
										for(var i =0; i < response.length ;i++){
											var executor = response[i].id;
											if((response[i].subject!= undefined)&&(response[i].subject != null)){
												for(var j =0; j < (response[i].subject).split(',').length;j++){
													if((response[i].subject).split(',')[j] == Subject){
														executors.push(executor);
													}
												}
											}
											if(i == response.length -1){
												if(executors[0]!= undefined){
													bot.sendMessage(executor_list, message+Docs+'\n Если есть вопросы,то пиши\n Чат id:'+countofwork+' \n Если готов принять заказ:\n Принять заказ id:'+countofwork +' \n\n Вложения:'+Photos)
												}
												else{
													bot.execute('messages.send', {
													  random_id: randomInteger(0, 18446744073709551614),
													  chat_id: 7,
													  message: message+Docs+Photos
													})
												}
											}
										}
									})
								}
							});
						}
						else{
							console.log(err);
						}
					}
					else{						
						connection.query("update user_"+user_Id+" set executor= 0, laststatus = status,status ='InProcessing'",function(err,response){
							if(err) console.log("ERROR",err);
							else {
								getExecutorList(function(response){	
								var executors = [];					
									for(var i =0; i < response.length ;i++){
										var executor = response[i].id;
										if((response[i].subject!= undefined)&&(response[i].subject != null)){
											for(var j =0; j < (response[i].subject).split(',').length;j++){
												if((response[i].subject).split(',')[j] == Subject){
													executors.push(executor);
												}
											}
										}
										if(i == response.length -1){
											if(executors[0]!= undefined){
												bot.sendMessage(executor_list, message+Docs+'\n Если есть вопросы,то пиши\n Чат id:'+countofwork+' \n Если готов принять заказ:\n Принять заказ id:'+countofwork +' \n\n Вложения:'+Photos)
											}
											else{
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 7,
												  message: message+Docs+Photos
												})
											}
										}
									}	
								});
							}
						});
					}
				})
				
			}
			else{
				BotReply(ctx,'Я не понимаю тебя, укажи ответ по примеру выше или начни заново Сброс'),
				BotReply(ctx,'Подожди.. Может ты хочешь связаться с тех.поддержкой?', Markup.keyboard([
				[
					Markup.button('Связаться с тех.поддержкой', 'primary')
				],
				[
					Markup.button('Сброс', 'positive')
				]
				]).oneTime());
			}
		}
	});
});
bot.command(['Диктовка','Переслать решение','Сдать за вас','Прислать решение','Передать курьером','Отработка','Нормативы'], (ctx) => {
	var user_Id = ctx.message.user_id;
	selectUser(user_Id).then(function(response){
		if(response[0].status =='typeOfWorkSelected'){
			if( (response[0].comment != null)&&((response[0].comment != 0)) ){
				databaseRequest("update userList set Task = '"+(ctx.message.body)+"',status='getSuccess' where id="+user_Id+" and orderFinished=0").then(function(){
					BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+ctx.message.body+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
						[
							Markup.button('Подтвердить', 'positive'),
							Markup.button('Отменить заказ', 'negative')
						],
						[
							Markup.button('Изменить заказ', 'default')
						],
						[
							Markup.button('Главное меню', 'positive')
						]
					]).oneTime());
				})				
			}
			else{
				databaseRequest("update userList set Task = '"+(ctx.message.body)+"',status='TaskSelected' where id="+user_Id+" and orderFinished=0").then(function(){
					BotReply(ctx,'Прикрепите все документы и фотографии, относящиеся к заданию, или пример билета, который вам встретится, чтобы мы могли оценить работу.\n\nP.s. Если у вас нет документов, нажмите "пропустить"', Markup.keyboard([
						[
							Markup.button('Пропустить', 'default')
						],
						[
							Markup.button('Отменить заказ', 'negative')
						]
					]).oneTime());
				})
			}			
		}
		else if (response[0].status == 'WaitsComment'){
			databaseRequest("update userList set comment = '"+ctx.message.body+"',status = 'getSuccess' where id="+user_Id+" and orderFinished=0").then(function(){
				databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
					BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
						[
							Markup.button('Подтвердить', 'positive'),
							Markup.button('Отменить заказ', 'negative')
						],
						[
							Markup.button('Изменить заказ', 'default')
						]
					]).oneTime());
				})	
			})	
		}
		else{
			BotReply(ctx,'Заказ уже имеет вид помощи.', Markup.keyboard([
				[
					Markup.button('Отменить заказ', 'negative')
				]
			]).oneTime());
		}
	})	
});
bot.command('Открыть спор', (ctx) => {
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(response){
		BotReply(ctx,'Вы не можете открыть спор являясь исполнителем.');
	}).catch(function(err){
		if(err == "not-exist"){
			if((ctx.message.body).split(':')[1]!= undefined){
				databaseRequest("update userList set status='InDiscusing' where workId="+(ctx.message.body).split(':')[1]).then(function(){
					searchByWorkId((ctx.message.body).split(':')[1]).then(function(response){
						var workid = response[0].workId;
						var Executor = response[0].executor;
						databaseRequest("select userChatId,executorChatId from chatList where workId="+workid).then(function(response){
							if(response != ''){
								let UserChatID = response[0].userChatId;
								let UserPeerID = 2000000000+UserChatID;	

								let ExecutorChatID = response[0].executorChatId;
								let ExecutorPeerID = 2000000000+ExecutorChatID;	
								if( (ExecutorChatID != null)&&(ExecutorChatID != 0) ){	
									EASYBOTVK.call('messages.getInviteLink', {
										peer_id: ExecutorPeerID,
										group_id:148975156,
									}).then(function(ExecutorChatLink){
										bot.sendMessage(Executor,'Внимание\n Открыт спор по заказу ID:'+workid+'\n '+ExecutorChatLink.link,null,Markup.keyboard(
											[
												Markup.button('Получить информацию id:'+workid,'primary'),
												Markup.button('Указать стоимость','positive')
											],
											[
												Markup.button('Главное меню', 'positive')
											],
											[
										  		Markup.button('Вызвать менеджера','primary')
										  	]
										));
										bot.execute('messages.send', {
										    random_id: randomInteger(0, 18446744073709551614),
											peer_id: ExecutorPeerID,
											chat_id: ExecutorChatID,
											message: 'Внимание\n Открыт спор по заказу ID:'+workid,
											keyboard: Markup.keyboard([
											[
										  		Markup.button('Получить информацию о заказе','primary'),
												Markup.button('Указать стоимость','positive')
										  	],
											[
										  		Markup.button('Завершить заказ','positive')
										  	],
											[
										  		Markup.button('Вызвать менеджера','primary')
										  	]
											]),
											group_id:148975156,
										}).then(function(){}).catch(function(){})
									})		
								}
								else if( specIDs.includes(parseInt(Executor),0) ){
									EASYBOTVK.call('messages.getInviteLink', {
										peer_id: UserPeerID,
										group_id:148975156,
									}).then(function(ExecutorChatLink){
										bot.sendMessage(Executor,'Внимание\n Открыт спор по заказу ID:'+workid+'\n '+ExecutorChatLink.link,Markup.keyboard(
											[
												Markup.button('Получить информацию id:'+workid,'primary'),
												Markup.button('Указать стоимость','positive')
											],
											[
												Markup.button('Главное меню', 'positive')
											],
											[
										  		Markup.button('Вызвать менеджера','primary')
										  	]
										));
									})	
								}
								else{
									EASYBOTVK.call('messages.getInviteLink', {
										peer_id: ExecutorPeerID,
										group_id:148975156,
									}).then(function(ExecutorChatLink){
										bot.sendMessage(Executor,'Внимание\n Открыт спор по заказу ID:'+workid+'\n '+ExecutorChatLink.link,null,Markup.keyboard(
											[
												Markup.button('Получить информацию id:'+workid,'primary'),
												Markup.button('Указать стоимость','positive')
											],
											[
												Markup.button('Главное меню', 'positive')
											],
											[
										  		Markup.button('Вызвать менеджера','primary')
										  	]
										));
									})									
								}
								EASYBOTVK.call('messages.getInviteLink', {
									peer_id: UserPeerID,
									group_id:148975156,
								}).then(function(UserChatLink){
									BotReply(ctx,'Вы открыли спор. Агент скоро с вами свяжется.\n'+UserChatLink.link,null,Markup.keyboard([
											Markup.button('Мои заказы','positive'),										
											Markup.button('Сброс','negative')
										],
										[
											Markup.button('Главное меню', 'positive')
										]
									))
								})	
							}	
							else{
								bot.sendMessage(Executor,'Внимание\n Открыт спор по заказу ID:'+workid+'\n ',Markup.keyboard(
									[
										Markup.button('Получить информацию id:'+workid,'primary'),
										Markup.button('Указать стоимость','positive')
									],
									[
								  		Markup.button('Вызвать менеджера','primary')
								  	],
									[
										Markup.button('Главное меню', 'positive')
									]
								));
								BotReply(ctx,'Вы открыли спор. Агент скоро с вами свяжется.\n',Markup.keyboard([
										Markup.button('Мои заказы','positive'),										
										Markup.button('Сброс','negative')
									],
									[
										Markup.button('Главное меню', 'positive')
									]
								))	
							}					
						})						
					})
				})
			}
		}
	})	
})
bot.command('Получить ссылку', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(){
		if((ctx.message.body).split(':')[1]!= undefined){
			databaseRequest("select chat from userList where workId="+(ctx.message.body).split(':')[1]).then(function(response){
				let messagesChatID = response[0].chat;
				let messagesPeerID = 2000000000+messagesChatID;						
				EASYBOTVK.call('messages.getInviteLink', {
					peer_id: messagesPeerID,
					group_id:148975156,
				}).then(function(chatLink){
					BotReply(ctx,'Ссылка на беседу заказа с ID: '+chatLink.link,Markup.keyboard([
						[
							Markup.button('Главное меню', 'positive')
						]
					]))
				})				
			})
		}
	})	
})
bot.command('Главное меню',(ctx) => {
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(response){
		connection.query("update grandadmin set setSideTo=0,setworktypeto =0,priceto=0,getExecutorList=0 where id="+user_Id,function(err,response){
			if(err) console.log("ERROR",err);
			else {
					BotReply(ctx,'Доступные команды', Markup.keyboard([
					[
						Markup.button('список исполнителей', 'positive'),
					],
					[
						Markup.button('назначить исполнителем', 'positive'),
						Markup.button('удалить исполнителя', 'negative')
					],
					[
						Markup.button('Список заказов', 'positive')
					]
					]).oneTime())
			}
		})
	}).catch(function(){
		isExecutor(user_Id).then(function(){
			BotReply(ctx,'С возвращением!', Markup.keyboard([
				[
					Markup.button('Мои заказы', 'positive'),
					Markup.button('Мои предметы','positive')
				],
				[
					Markup.button('Открытые споры', 'primary')
				],
				[
					Markup.button('Список заказов', 'positive')
				]
			]).oneTime());
		}).catch(function(){
			BotReply(ctx,'С возвращением!', Markup.keyboard([
				[
					Markup.button('Заказать', 'positive'),
					Markup.button('В другой раз', 'negative')
				],
				[
					Markup.button('Задать вопрос', 'positive')
				],
				[
					Markup.button('Мои заказы', 'positive')
				]
			]).oneTime());
		})
	})		
})
//////////////////////admin////////////////////////
bot.command('список исполнителей', (ctx) => {
	console.log('/////Список исполнителей//////');
	let user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(response){
			connection.query("update grandadmin set getExecutorList = 1 where id="+user_Id,function(err,response){
				if(err) console.log("ERROR",err);
				else {
					BotReply(ctx,'Выбери предмет\n'+subjectList, Markup.keyboard([
					[
							Markup.button('список команд', 'negative')
					]
					]).oneTime());
				}
			});
	})
});
bot.command('добавить', (ctx) => {
	let user_Id = ctx.message.user_id;
	isAdmin(ctx.message.user_id).then(function(response){
		connection.query("select * from grandadmin where id="+user_Id,function(err,response){
				if(err) console.log("ERROR",err);
				else {
				var user_Id = ctx.message.user_id;
				if((response[0].setworktypeto == null)||(response[0].setworktypeto == 0)){
					if((ctx.message.body).split('https://vk.com/')[1]!= undefined){
							bot.execute('users.get', {
							  user_ids:(ctx.message.body).split('https://vk.com/')[1]
							}).then(function(resp){
								connection.query("update grandadmin set setworktypeto = "+resp[0].id+" where id="+user_Id,function(err,response){
									if(err) console.log("ERROR",err);
									else { 
										BotReply(ctx,'Выберите предмет для исполнителя.\n'+subjectList)
									}
								});
							});
					}
				}
				else{
					BotReply(ctx,'Исполнитель не выбран')
				}
			}
		})
	})
})
/*bot.command('Удалить все беседы', (ctx) => {
	isAdmin(ctx.message.user_id).then(function(response){
		EASYBOTVK.call('messages.getConversations').then(function(){
			EASYBOTVK.call('messages.deleteConversation',{
				peer_id:2000000200
			}).then(function(result){
				console.log(result);
			})
		})
	})
})*/
bot.command('назначить исполнителем', (ctx) => {
	let user_Id = ctx.message.user_id;
	isAdmin(ctx.message.user_id).then(function(response){
		connection.query("update grandadmin set setSideTo=1 where id="+user_Id,function(err,response){
			if(err) console.log("ERROR",err);					
			else {
				BotReply(ctx,'Введите ссылку.'),
				 Markup.keyboard([
				[
					Markup.button('список команд', 'negative')
				],
				]);
			}
		});
	})
});
bot.command('удалить исполнителя', (ctx) => {
	isAdmin(ctx.message.user_id).then(function(response){
		if((ctx.message.body).split('https://vk.com/')[1]!= undefined){
				bot.execute('users.get', {
				  user_ids:(ctx.message.body).split('https://vk.com/')[1]
				}).then(function(resp){
					databaseRequest("delete from executorList where id="+resp[0].id).then(function(){
						BotReply(ctx,'Вы удалили '+resp[0].id+' из списка исполнителей.', Markup.keyboard([
						[
							Markup.button('список администраторов', 'positive')
						]
						]).oneTime())
					})
				});
		}
		else{
			BotReply(ctx,'Ошибка команды.')
		}
	})				
});
bot.command('список команд', (ctx) => {
	isAdmin(ctx.message.user_id).then(function(response){
		connection.query("update grandadmin set setSideTo=0,setworktypeto =0,priceto=0,getExecutorList=0 where id="+ctx.message.user_id,function(err,response){
			if(err) console.log("ERROR",err);
			else {
					BotReply(ctx,'Доступные команды', Markup.keyboard([
						[
							Markup.button('список исполнителей', 'positive'),
						],
						[
							Markup.button('назначить исполнителем', 'positive'),
							Markup.button('удалить исполнителя', 'negative')
						],
						[
							Markup.button('Список заказов', 'positive')
						],
						[
							Markup.button('Авторизация', 'primary'),
							Markup.button('Всем исполнителям', 'primary'),							
						]
					]))
			}
		})
	})
});
bot.command('Стать администратором', (ctx) => {
	var user_Id = ctx.message.user_id;
	connection.query("select id from grandadmin where id="+user_Id,function(err,response){
		if(err) console.log("ERROR",err);
		else {
			if( (response == '')&&(specIDs.includes(user_Id,0) ) ){				
				databaseRequest("insert grandadmin (id) values("+user_Id+")").then(function(){
					databaseRequest("insert executorList (id,chat,subject,setpriceto,waitto) values("+user_Id+",0,'Затычка',0,0)").then(function(){
						BotReply(ctx,'Вы стали администратором. ', Markup.keyboard([
						[
							Markup.button('список команд', 'positive')
						]
						]).oneTime())
					})
				})
			}
			else{
				BotReply(ctx,'И не надейся. ')
			}
		}
	});
});
bot.command('админ', (ctx) => {
	var user_Id = ctx.message.user_id;
	databaseRequest('select id from grandadmin where id='+user_Id).then(function(response){
		if( (response != '')&&(response[0].id != null) ){
			console.log('Администратор уже назначен');
			isAdmin(user_Id).then(function(response){
				BotReply(ctx,'С возвращением. ', Markup.keyboard([
				[
					Markup.button('список команд', 'positive')
				]
				]).oneTime())
			}).catch(function(err){
				console.log('Админ',err);
			})
		}
	}).catch(function(err){
		databaseRequest("create table grandadmin(id int,setworktypeto int,priceto int, setSideTo int, getExecutorList int, ApproximatePriceFrom int,ApproximatePriceTo int,massMessageto text)").then(function(){
			databaseRequest("insert executorList (id,chat,subject,setpriceto,waitto) values("+user_Id+",0,'Затычка',0,0)").then(function(){
				BotReply(ctx,'Администратор еще не назначен. ',Markup.keyboard([
				[
					Markup.button('Стать администратором', 'positive')
				]
				]).oneTime())
			})
		})
		console.log(1882,err);
	})
});
bot.command('Оплаченные', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){	
		let countOfItems = 0;
		databaseRequest("select workId,subject from userList where paid=1").then(function(response){
			countOfItems = response.length;
			let madeItems = 0;
			function sendInfo(){
				if( madeItems != countOfItems ){
					if( response[madeItems].workId != null ){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}		
					else{
						madeItems++;
						sendInfo();		
					}	
				}		
				else if(countOfItems == 0) BotReply(ctx,'Список пуст');
				else BotReply(ctx,'Список пуст');			
			}
			sendInfo();	
		}).catch(function(err){
			console.log(2239,err);
		})
	}).catch(function(err){
		console.log(2240,err);
	})
});
bot.command('Найти исполнителя', (ctx)=>{
	if((ctx.message.body).split(':')[1] = 'undefined'){
		searchByWorkId((ctx.message.body).split(':')[1]).then(function(response){
			Search(response[0].id,response[0].workId);
			BotReply(ctx,'Информация отправлена')
		}).catch(function(err){
			if(err == 'not-found'){
				BotReply(ctx,'Заказа с ID: '+response[0].workId +' не найдено.')
			}
			else if(err == "workId doesn't exist"){
				BotReply(ctx,'Не указан ID')
			}
			else{
				console.log(3531,err);
			}
		})		
	}
	else{
		BotReply(ctx,"Ошибка команды. Возможно не указан ID")
	}
})
bot.command('Отказы', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){	
		let countOfItems = 0;
		databaseRequest("select workId,subject from userList where status='Declined'").then(function(response){
			countOfItems = response.length;
			let madeItems = 0;
			function sendInfo(){
				if( madeItems != countOfItems ){
					if( response[madeItems].workId != null ){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}		
					else{
						madeItems++;
						sendInfo();		
					}	
				}		
				else if(countOfItems == 0) BotReply(ctx,'Список пуст');
				else BotReply(ctx,'Список пуст');			
			}
			sendInfo();	
		}).catch(function(err){
			console.log(2239,err);
		})
	}).catch(function(err){
		console.log(2240,err);
	})
});
bot.command('Ожидающие наценку', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){	
		let countOfItems = 0;
		databaseRequest("select workId,subject from userList where status='PriceSelected'").then(function(response){
			countOfItems = response.length;
			let madeItems = 0;
			function sendInfo(){
				if( madeItems != countOfItems ){
					if( response[madeItems].workId != null ){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('стоимость '+response[madeItems].workId, 'primary'),
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}		
					else{
						madeItems++;
						sendInfo();		
					}	
				}		
				else if(countOfItems == 0) BotReply(ctx,'Список пуст');
				else BotReply(ctx,'Список пуст');			
			}
			sendInfo();	
		}).catch(function(err){
			console.log(2239,err);
		})
	}).catch(function(err){
		console.log(2240,err);
	})
});
bot.command('Ждем денег', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){	
		let countOfItems = 0;
		databaseRequest("select workId,subject from userList where status='PriceSuccess'").then(function(response){
			countOfItems = response.length;
			let madeItems = 0;
			function sendInfo(){
				if( madeItems != countOfItems ){
					if( response[madeItems].workId != null ){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}		
					else{
						madeItems++;
						sendInfo();		
					}	
				}		
				else if(countOfItems == 0) BotReply(ctx,'Список пуст');
				else BotReply(ctx,'Список пуст');			
			}
			sendInfo();	
		}).catch(function(err){
			console.log(2239,err);
		})
	}).catch(function(err){
		console.log(2240,err);
	})
});
/*bot.command('В чате', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){
		databaseRequest("select workId from userList where status='WaitsResponse'").then(function(response){
			for(var i =0; i < response.length ;i++){
				if(response[i].status == 'Declined'){
					buttons.push([
							Markup.button('Чат id:'+response[i].workId, 'primary'),
							Markup.button('Получить информацию id:'+response[i].workId, 'primary')
						],
						[
							Markup.button('Найти исполнителя id:'+response[i].workId, 'positive')
						]
					)
				}						
			}
			if(buttons[1] == undefined){	
				BotReply(ctx,'Нет доступных заказов.');
			}
			else{
				BotReply(ctx,'Список доступных заказов.', Markup.keyboard(buttons));
			}
		})
	})	

	var buttons = [];
	buttons.push(
		[
			Markup.button('Список заказов', 'positive'),
		]
	)
	getUserList().then(function(response){
		for(var i =0; i < response.length ;i++){
			if(response[i].chatStatus == 'WaitsResponse'){
				buttons.push([
						Markup.button('Чат id:'+response[i].workId, 'primary'),
						Markup.button('Получить информацию id:'+response[i].workId, 'primary')
					]
				)
			}
		}
		getHistoryList().then(function(response){
			for(var i =0; i < response.length;i++){
				if(response[i].chatStatus == 'WaitsResponse'){
					buttons.push([
							Markup.button('Чат id:'+response[i].workId, 'primary'),
							Markup.button('Получить информацию id:'+response[i].workId, 'primary')
						]
					)
				}
			}
			if(buttons[1] == undefined){	
				BotReply(ctx,'Нет доступных заказов.');
			}
			else{
				BotReply(ctx,'Список доступных заказов.', Markup.keyboard(buttons));
			}
		}).catch(function(err){
			if(err == 'Список истории пуст'){
				if(buttons[1] == undefined){	
					BotReply(ctx,'Нет доступных заказов.');
				}
				else{
					BotReply(ctx,'Список доступных заказов.', Markup.keyboard(buttons));
				}
			}
			else{
				console.log(err);
			}
		});	
	}).catch(function(err){
		if(err == 'Список пользователей пуст'){
			BotReply(ctx,'Список пуст')
		}
		else{
			console.log(err);
		}
	})
});*/
bot.command('В процессе', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){	
		databaseRequest("select workId,subject,executor from userList where status='InProcessing' ").then(function(response){
			countOfItems = response.length;
			let madeItems = 0;
			function sendInfo(){
				if( madeItems != countOfItems ){
					if( (response[madeItems].workId != null)&&(response[madeItems].executor == null) ){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('Завершить заказ id:'+response[madeItems].workId, 'positive'),
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							],
							[
								Markup.button('Найти исполнителя id:'+response[madeItems].workId, 'positive')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}	
					else if((response[madeItems].workId != null)&&(response[madeItems].executor != null)){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('Завершить заказ id:'+response[madeItems].workId, 'positive'),
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}	
					else{
						madeItems++;
						sendInfo();		
					}	
				}		
				else if(countOfItems == 0) BotReply(ctx,'Список пуст');
				else BotReply(ctx,'Список пуст');		
			}
			sendInfo();	
		})
	}).catch(function(){
		isExecutor(user_Id).then(function(){
			databaseRequest("select * from userList where executor="+user_Id+" and status!='Declined' and status !='Completed' ").then(function(response){
				countOfItems = response.length;
				let madeItems = 0;
				function sendInfo(){
					if( madeItems != countOfItems ){
						if( response[madeItems].workId != null ){
							BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
								[
									Markup.button('Завершить заказ id:'+response[madeItems].workId, 'positive'),
									Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
								]
							]).inline());
							setTimeout(function(){
								madeItems++;
								sendInfo();
							},300)
						}		
						else{
							madeItems++;
							sendInfo();		
						}	
					}		
					else if(countOfItems == 0) BotReply(ctx,'Список пуст');
					else BotReply(ctx,'Список пуст');			
				}
				sendInfo();	
			}).catch(function(err){
				console.log(err);
			})
		}).catch(function(){			
			databaseRequest("select subject,workId from userList where status !='Completed' and status !='Declined' and id="+user_Id).then(function(response){
				countOfItems = response.length;
				let madeItems = 0;
				function sendInfo(){
					if( madeItems != countOfItems ){
						if( response[madeItems].workId != null ){
							BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
								[
									Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
								]
							]).inline());
							setTimeout(function(){
								madeItems++;
								sendInfo();
							},300)
						}		
						else{
							madeItems++;
							sendInfo();		
						}	
					}		
					else if(countOfItems == 0) BotReply(ctx,'Список пуст');
					else BotReply(ctx,'Список пуст');		
				}
				sendInfo();	
			})
		})		
	})
});
bot.command('Завершенные', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){
		databaseRequest("select workId,subject from userList where status='Completed'").then(function(response){
			if(response != ''){
				countOfItems = response.length;
				let madeItems = 0;
				function sendInfo(){
					if( madeItems != countOfItems ){
						if( response[madeItems].workId != null ){
							BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
								[
									Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
								],
								[
									Markup.button('Найти исполнителя id:'+response[madeItems].workId, 'positive')
								]
							]).inline());
							setTimeout(function(){
								madeItems++;
								sendInfo();
							},300)
						}		
						else{
							madeItems++;
							sendInfo();		
						}	
					}		
					else BotReply(ctx,'Список пуст');		
				}
				sendInfo();	
			}
			else{
				BotReply(ctx,'Нет завершенных заказов')
			}
		})
	}).catch(function(){
		isExecutor(user_Id).then(function(){
			databaseRequest("select workId,subject from userList where executor="+user_Id+" and status ='Completed' ").then(function(response){
				if(response != ''){
					countOfItems = response.length;
					let madeItems = 0;
					function sendInfo(){
						if( madeItems != countOfItems ){
							if( response[madeItems].workId != null ){
								BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
									[
										Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
									]
								]).inline());
								setTimeout(function(){
									madeItems++;
									sendInfo();
								},300)
							}		
							else{
								madeItems++;
								sendInfo();		
							}	
						}		
						else BotReply(ctx,'Список пуст');		
					}
					sendInfo();	
				}
				else{
					BotReply(ctx,'Нет завершенных заказов')
				}
			}).catch(function(err){
				console.log(err);
			})
		}).catch(function(){
			databaseRequest("select workId,subject from userList where id="+user_Id+" and status ='Completed' ").then(function(response){				
				if(response != ''){
					countOfItems = response.length;
					let madeItems = 0;
					function sendInfo(){
						if( madeItems != countOfItems ){
							if( response[madeItems].workId != null ){
								BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
									[
										Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
									],
									[
										Markup.button('Открыть спор id:'+response[madeItems].workId, 'negative')
									]
								]).inline());
								setTimeout(function(){
									madeItems++;
									sendInfo();
								},300)
							}		
							else{
								madeItems++;
								sendInfo();		
							}	
						}		
						else{
							BotReply(ctx,'Выберите следующее действие',Markup.keyboard([
								[
									Markup.button('В процессе', 'primary')
								],
								[
									Markup.button('Завершенные', 'positive')
								],
								[
									Markup.button('Главное меню', 'positive')
								]
							]));
							return;
						}
					}
					sendInfo();
				}
				else{
					BotReply(ctx,'Нет завершенных заказов',Markup.keyboard([
						[
							Markup.button('В процессе', 'primary')
						],
						[
							Markup.button('Завершенные', 'positive')
						],
						[
							Markup.button('Главное меню', 'positive')
						]
					]))
				}
			})				
		})
	})
});
bot.command('Открытые споры', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){
		databaseRequest("select workId,subject from userList where status='InDiscusing'").then(function(response){			
				countOfItems = response.length;
				let madeItems = 0;
				function sendInfo(){
					if( madeItems != countOfItems ){
						if( response[madeItems].workId != null ){
							BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
								[
									Markup.button('Получить ссылку id:'+response[madeItems].workId, 'primary'),
									Markup.button('Завершить заказ id:'+response[madeItems].workId, 'primary')
								],
								[
									Markup.button('Найти исполнителя id:'+response[madeItems].workId, 'positive')
								]
							]).inline());
							setTimeout(function(){
								madeItems++;
								sendInfo();
							},300)
						}		
						else{
							madeItems++;
							sendInfo();		
						}	
					}		
					else if(countOfItems == 0) BotReply(ctx,'Список пуст');
					else BotReply(ctx,'Список пуст');		
				}
				sendInfo();	
		})
	}).catch(function(){
		isExecutor(user_Id).then(function(){
			databaseRequest("select workId from userList where status='InDiscusing'").then(function(response){
				countOfItems = response.length;
				let madeItems = 0;
				function sendInfo(){
					if( madeItems != countOfItems ){
						if( response[madeItems].workId != null ){
							BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
								[
									Markup.button('Получить ссылку id:'+response[madeItems].workId, 'primary'),
									Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
								]
							]).inline());
							setTimeout(function(){
								madeItems++;
								sendInfo();
							},300)
						}		
						else{
							madeItems++;
							sendInfo();		
						}	
					}		
					else if(countOfItems == 0) BotReply(ctx,'Список пуст');
					else BotReply(ctx,'Список пуст');		
				}
				sendInfo();	
			})
		})
	})
});
bot.command('В согласовании', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){	
		let countOfItems = 0;
		databaseRequest("select workId,subject from userList where status='waitToPriceResponse'").then(function(response){
			countOfItems = response.length;
			let madeItems = 0;
			function sendInfo(){
				if( madeItems != countOfItems ){
					if( response[madeItems].workId != null ){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}		
					else{
						madeItems++;
						sendInfo();		
					}	
				}		
				else if(countOfItems == 0) BotReply(ctx,'Список пуст');
				else BotReply(ctx,'Список пуст');			
			}
			sendInfo();	
		}).catch(function(err){
			console.log(2239,err);
		})
	}).catch(function(err){
		console.log(2240,err);
	})
});
bot.command('Личные', (ctx)=>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(){	
		let countOfItems = 0;
		databaseRequest("select workId,subject from userList where status='Personal'").then(function(response){
			countOfItems = response.length;
			let madeItems = 0;
			function sendInfo(){
				if( madeItems != countOfItems ){
					if( response[madeItems].workId != null ){
						BotReply(ctx,'Заказ id:'+response[madeItems].workId+' Предмет: '+response[madeItems].subject, Markup.keyboard([
							[
								Markup.button('Завершить заказ id:'+response[madeItems].workId, 'positive'),
								Markup.button('Получить информацию id:'+response[madeItems].workId, 'primary')
							],
							[
								Markup.button('Найти исполнителя id:'+response[madeItems].workId, 'positive')
							]
						]).inline());
						setTimeout(function(){
							madeItems++;
							sendInfo();
						},300)
					}		
					else{
						madeItems++;
						sendInfo();		
					}	
				}		
				else if(countOfItems == 0) BotReply(ctx,'Список пуст');
				else BotReply(ctx,'Список пуст');			
			}
			sendInfo();	
		}).catch(function(err){
			console.log(2239,err);
		})
	}).catch(function(err){
		console.log(2240,err);
	})
});
bot.command(['Сегодня','Завтра','Через неделю','Через месяц','Не знаю','Другая','Идет сейчас!'], (ctx)=>{
	var user_Id = ctx.message.user_id;
	databaseRequest('select status from userList where id='+user_Id+" and orderFinished=0").then(function(response){
		if(response == ''){
			BotReply(ctx,'Привет Наша команда готова помочь тебе с учебой. Тебе нужна помощь?', Markup.keyboard([
				[
					Markup.button('Заказать', 'positive'),
					Markup.button('В другой раз', 'negative')
				],
				[
					Markup.button('Задать вопрос', 'positive')
				],
				[
					Markup.button('Мои заказы', 'positive')
				]
			]).oneTime());
		}
		else if(response[0].status == 'setDeadline'){
			if(ctx.message.body == "Другая"){
				BotReply(ctx,'Укажие дедлайн в любом удобном формате')
			}
			else{
				selectUser(user_Id).then(function(response){
					if( (response[0].comment !=null)&&(response[0].comment !=0) ){
						databaseRequest('update userList set deadline = "'+ctx.message.body+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){		
							BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+ctx.message.body+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
							[
								Markup.button('Подтвердить', 'positive'),
								Markup.button('Отменить заказ', 'negative')
							],
							[
								Markup.button('Изменить заказ', 'default')
							]
						]).oneTime());
						}).catch(function(err){
							console.log(2158,err);
						})										
					}
					else{
						databaseRequest('update userList set deadline = "'+ctx.message.body+'", status="setWorkTime" where id='+user_Id+" and orderFinished=0").then(function(){							
							BotReply(ctx,'Укажите время начала работы (по Москве) по примеру: 8:30', Markup.keyboard([
								[
									Markup.button('Идет сейчас!', 'positive'),
								],
								[
									Markup.button('Не знаю','negative')
								],
								[
									Markup.button('Отменить заказ', 'negative')
								],
								[
									Markup.button('Главное меню', 'positive')
								]
							]).oneTime());
						}).catch(function(err){
							console.log(2158,err);
						})	
					}
				})
			}			
		}
		else if(response[0].status == 'WaitsComment'){
			selectUser(user_Id).then(function(response){
				databaseRequest('update userList set comment = "'+ctx.message.body+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){		
					BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+ctx.message.body, Markup.keyboard([
					[
						Markup.button('Подтвердить', 'positive'),
						Markup.button('Отменить заказ', 'negative')
					],
					[
						Markup.button('Изменить заказ', 'default')
					]
				]).oneTime());
				}).catch(function(err){
					console.log(2158,err);
				})	
			})
		}
		else if(response[0].status == 'setWorkTime'){
			selectUser(user_Id).then(function(response){
					if( (response[0].comment !=null)&&(response[0].comment !=0) ){
						databaseRequest('update userList set workTime = "'+ctx.message.body+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){		
							BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+ctx.message.body+'\nКомментарий:'+response[0].comment, Markup.keyboard([
							[
								Markup.button('Подтвердить', 'positive'),
								Markup.button('Отменить заказ', 'negative')
							],
							[
								Markup.button('Изменить заказ', 'default')
							]
						]).oneTime());
						}).catch(function(err){
							console.log(2158,err);
						})										
					}
					else{
						databaseRequest('update userList set workTime = "'+ctx.message.body+'", status="WaitsComment" where id='+user_Id+" and orderFinished=0").then(function(){							
							BotReply(ctx,'Опишите максимально подробно заказ, чтобы мы точно оценили работу (какие нужны номера, номер варианта, нужна ли теория и т.д.).Если у вас есть промокод, укажите его.', Markup.keyboard([
								[
									Markup.button('Отменить зазказ', 'primary'),
								]
							]).oneTime());
						}).catch(function(err){
							console.log(2158,err);
						})	
					}
				})
		}
	})
});
bot.command('стоимость', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(response){
		if(((ctx.message.body).split('стоимость')[1]).split(' ')[1]!= undefined){		
			searchByWorkId(((ctx.message.body).split('стоимость')[1]).split(' ')[1]).then(function(response){
				databaseRequest("update grandadmin set priceto="+((ctx.message.body).split('стоимость')[1]).split(' ')[1]+" where id="+user_Id).then(function(){
					BotReply(ctx,'Укажите стоимость пример: 1700');
				}).catch(function(err){})
			}).catch(function(err){
				if(err == 'not-found'){
					BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[0] +' не найдено.')
				}
				else if(err == "workId doesn't exist"){
					BotReply(ctx,'Не указан ID')
				}
				else{
					console.log(3531,err);
				}
			})
		}
		else{
			BotReply(ctx,'Ошибка команды. Заказа с id:'+((ctx.message.body).split(':')[1]).split(' ')[0]+' нет.')
		}	
	}).catch(function(err){
		BotReply(ctx,'Вы не являетесь администратором')
	})
})
bot.command('оплачено', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(response){
		databaseRequest("update userList set paid=1 where workId="+((ctx.message.body).split('оплачено')[1]).split(' ')[1]).then(function(){
			searchByWorkId( (ctx.message.body).split('оплачено')[1] ).then(function(response){
				var message = 'Ваш заказ:\n Предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+'\n Задание: '+response[0].Task +'\n Оплачен и передан на исполнение.';
				let userChatID = response[0].chat;
				let userPeerID = 2000000000+userChatID;
				bot.execute('messages.send', {
				    random_id: randomInteger(0, 18446744073709551614),
					peer_id:userPeerID,
					chat_id: userChatID,
					message: message,
					group_id:148975156,
				}).then(function(response){
					console.log(response);
				}).catch(function(err){
					console.log(err);
				})

				if((response[0].executor != null)&&(response[0].executor != 0)){
					let message = 'Заказ: #'+response[0].workId+' оплачен.\n Предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+'\n Задание: '+response[0].Task;
					bot.sendMessage(response[0].executor,message,Markup.keyboard(
						[
							Markup.button('Получить информацию id:'+response[0].workId,'primary')
						]
					));
				}
				BotReply(ctx,'Информация отправлена заказчику.',null, Markup.keyboard([
					[
						Markup.button('список команд', 'positive')
					]
				]).oneTime())
			})
		})
	})
})
bot.command('Отказы специалистов', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(response){
		databaseRequest("select workId,whoIsDeclined form userList")
	})
})
bot.command('Статистика', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isAdmin(user_Id).then(function(response){
		BotReply(ctx,'Выберите род статистики',Markup.keyboard([
			[
				Markup.button('Отказы специалистов','negative')
			]
		]))
	})
})
///////////////////////////Исполнители//////////////////////////////////
bot.command(['Успешно','Безуспешно'], (ctx) =>{
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(response){
		if( (ctx.message.body).split(" ID:")[0] =='Успешно'){
			searchByWorkId((ctx.message.body).split(":")[1]).then(function(response){
				var message = 'Заказ завершен. Мы были рады Вам помочь!\nА теперь, если вас не затруднит, оставьте пожалуйста нам отзыв.\nЗаранее спасибо\n https://vk.com/app6326142_-148975156';
				let userChatID = response[0].chat;
				let userPeerID = 2000000000+userChatID;
				bot.execute('messages.send', {
				    random_id: randomInteger(0, 18446744073709551614),
					peer_id:userPeerID,
					chat_id: userChatID,
					message: message,
					group_id:148975156,
				}).then(function(response){
					console.log(response);
				}).catch(function(err){
					console.log(err);
				})
				BotReply(ctx,'Спасибо за отзыв.', Markup.keyboard([
					[
						Markup.button('Мои заказы', 'positive')
					],
					[
						Markup.button('Открытые споры', 'primary')
					],
					[
						Markup.button('Список заказов', 'positive')
					]
				]).oneTime())
			}).catch(function(err){
				if(err == 'not-found'){
					BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[0] +' не найдено.')
				}
				else if(err == "workId doesn't exist"){
					BotReply(ctx,'Не указан ID')
				}
				else{
					console.log(2035,err);
				}
			})
		}	
		else BotReply(ctx,'Спасибо за отзыв.');	
	})
})
bot.command('Завершить заказ', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(response){
		if((ctx.message.body).split(":")[1]!= undefined){
			searchByWorkId((ctx.message.body).split(":")[1]).then(function(response){				
				databaseRequest("update userList set status ='Completed' where workId="+(ctx.message.body).split(":")[1]).then(function(){
					BotReply(ctx,'Заказ был завершен. Укажите, как был закрыт заказ?', Markup.keyboard([
					[
						Markup.button('Успешно ID:'+(ctx.message.body).split(":")[1], 'positive'),
						Markup.button('Безуспешно ID:'+(ctx.message.body).split(":")[1], 'negative')
					]
					,[
						Markup.button('Список заказов', 'primary')
					]
					]).oneTime())					
				})
			}).catch(function(err){
				if(err == 'not-found'){
					BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[0] +' не найдено.')
				}
				else if(err == "workId doesn't exist"){
					BotReply(ctx,'Не указан ID')
				}
				else{
					console.log(2035,err);
				}
			})
		}
	}).catch(function(){
		BotReply(ctx,'Команда не доступна смертным')
	});
})
bot.command('Мои заказы', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(response){	
		var buttons = [];
		buttons.push(
			[
				Markup.button('Список заказов', 'positive')
			],
			[
				Markup.button('В процессе', 'primary')												
			],
			[
				Markup.button('Открытые споры', 'positive')
			],
			[
				Markup.button('Завершенные', 'positive')												
			],
			[
				Markup.button('Главное меню', 'positive')												
			]
		);
		BotReply(ctx,'Выберите список.', Markup.keyboard([
			[
				Markup.button('В процессе', 'primary')												
			],
			[
				Markup.button('Завершенные', 'positive')												
			],
			[
				Markup.button('Главное меню', 'positive')												
			]
		]));		
	}).catch(function(err){
		if(err == "not-exist"){ 			
			BotReply(ctx,'Выберите список.', Markup.keyboard([
				[
					Markup.button('В процессе', 'primary')												
				],
				[
					Markup.button('Завершенные', 'positive')												
				],
				[
					Markup.button('Главное меню', 'positive'),
				]
			]));				
		}
	})	
})
bot.command('Мои предметы', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(response){
		databaseRequest("select subject from executorList where id="+user_Id).then(function(response){
			if(response[0].subject != undefined){
				BotReply(ctx,'Ваши предметы: '+response[0].subject, Markup.keyboard([
					[
						Markup.button('Главное меню', 'positive')												
					],
				]));
			}	
			else{
				BotReply(ctx,'Список пуст', Markup.keyboard([
					[
						Markup.button('Главное меню', 'positive')												
					],
				]));
			}		
		})				
	})
})
/*bot.command('Завершить чат', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(response){	
		selectUser(user_Id).then(function(response){
			var userID = response[0].chat;
			connection.query("update executor_"+user_Id+" set chat=0",function(err,response){
				if(err) console.log("1998",err);
				else {
					selectUser(userID).then(function(response){
						var workid =response[0].workId; 
						connection.query("update user_"+response[0].id+" set chat=0,chatStatus=0",function(err,response){
							if(err) console.log("2397",err);
							else {
								getExecutorList().then(function(response){																		
									for(var j =0;j < response.length;j++){
										if(response[j].waitto == workid){
										var executor = response[j].id;
										connection.query("update executor_"+response[j].id+" set waitto = 0",function(err,response){
											if(err) console.log("2013",err);
											else {
												bot.sendMessage(executor,'Заказчик с id:'+workid+' вышел из чата',null,Markup.keyboard([
														Markup.button('Получить информацию id:'+workid,'primary'),
														Markup.button('Чат id:'+workid,'primary'),
														Markup.button('Указать стоимость id:'+workid,'positive')
													]
												));
											}
										})
										}
									}
									BotReply(ctx,'Чат завершен. Не забудьте вы автоматически приняли заказ, но вы всегда можете Отклонить id:'+workid, Markup.keyboard([
									[
										Markup.button('Указать стоимость id:'+workid, 'primary'),
										Markup.button('Отклонить id:'+workid, 'negative')
									],
									[
										Markup.button('Список заказов', 'positive')
									]
									])),
									bot.sendMessage(user,'Чат закрыт.',null,Markup.keyboard([
										Markup.button('Мои заказы','positive')
									]) )
								}).catch(function(err){
									BotReply(ctx,'Ошибка команды')
								})
							}
						});
					}).catch(function(err){
						if(err == "not-exist"){
							getHistoryList().then(function(response){
								for(var i =0;i < response.length;i++){
									var user = response[i].id;
									var HISTORYworkid = response[i].workId;
									if((response[i].id == userID)&&( (response[i].chat != null)&&(response[i].chat != 0) )){
										connection.query("update history_"+HISTORYworkid+" set chat=0,chatStatus=0",function(err,response){
											if(err) console.log("ERROR",err);
											else {
												getExecutorList().then(function(response){																				
													for(var i =0;i < response.length;i++){
														if(response[i].waitto == user){
															bot.sendMessage(user,'Заказчик с id:'+HISTORYworkid+' вышел из чата',null,Markup.keyboard([
																	Markup.button('Получить информацию id:'+HISTORYworkid,'primary'),
																	Markup.button('Чат id:'+HISTORYworkid,'primary')
																]
															));
														}
													}
													BotReply(ctx,'Чат завершен.', Markup.keyboard([
													[
														Markup.button('Указать стоимость id:'+HISTORYworkid, 'primary'),
														Markup.button('Отклонить id:'+HISTORYworkid, 'negative')
													],
													[
														Markup.button('Список заказов', 'positive')
													]
													])
													),
													bot.sendMessage(user,'Чат закрыт.',null,Markup.keyboard([
														Markup.button('Мои заказы','positive')
													]) )
												})
											}
										});
										break;
									}
									else if(i == response.length-1){
										BotReply(ctx,'У вас нет активных чатов', Markup.keyboard([
										[
											Markup.button('Список заказов', 'positive')
										]
										]))
									}
								}
							})
						}
						else{
							console.log(2401,err);
						}
					})
				}
			});
		}).catch(function(err){
			console.log('2096',err);
		})
	});
});*/
bot.command(['Список заказов','Обновить список'], (ctx) =>{
	var user_Id = ctx.message.user_id; var buttons = []; let Items = [];
	isExecutor(user_Id).then(function(response){
		selectUser(user_Id).then(function(response){
				var WorkType = response[0].subject;
				isAdmin(ctx.message.user_id).then(function(response){
					BotReply(ctx,'Список доступных заказов.',   Markup.keyboard([
						[
							Markup.button('В процессе', 'positive'),Markup.button('Открытые споры', 'primary')
						],
						[
							Markup.button('Ожидающие наценку', 'primary'),Markup.button('В согласовании', 'primary')
						],
						[
							Markup.button('Ждем денег', 'positive'),Markup.button('Оплаченные', 'positive')
						],
						[
							Markup.button('Завершенные', 'primary'),Markup.button('Отказы', 'negative')
						],
						[
							Markup.button('Личные', 'positive')
						],
						[
							Markup.button('список команд', 'negative')
						]
					]));
				}).catch(function(){					
					getUserList().then(function(response){					
						for(var i =0; i < response.length ;i++){
							if( ( ( response[i].whoIsDeclined == null )||(response[i].whoIsDeclined.split(',').includes((user_Id).toString(),0) == false) )&&(response[i].Task != 'Диктовка')&&(response[i].Task != 'Сдать за вас')&&(response[i].Task != 'Передать курьером')&&(response[i].Task != 'Лабораторная работа')&&(response[i].Task != 'Отработка')&&(response[i].Task != 'Нормативы')&&(response[i].userInChat != null) ){
								for(var j =0; j < WorkType.split(',').length;j++){
									if((WorkType.split(',')[j] == response[i].subject)&&( (response[i].executor == 0)||(response[i].executor == null) )&&((response[i].status != 'Declined')&&(response[i].status != 'Completed')&&(response[i].status != 'Personal'))){
										if(!Items.includes(response[i],0) ) Items.push(response[i])
									}
									else if((WorkType.split(',')[j] != response[i].subject)){
										console.log(2427,WorkType.split(',')[j],response[i].subject);
									}
									else if((response[i].executor != 0)||(response[i].executor != null)){
										console.log(2430,response[i].executor);
									}
									else{
										console.log(2433,response[i].status);
									}
								}
							}							
						}
						buttons.push(
							[
								Markup.button('Обновить список', 'positive')
							],
							[
								Markup.button('Главное меню', 'positive')
							]
						)
						if(Items[0] == undefined){	
							BotReply(ctx,'Нет доступных заказов.', Markup.keyboard(buttons));
						}
						else{
							countOfItems = Items.length;
							let madeItems = 0;
							function sendInfo(){
								if( madeItems != countOfItems ){
									var Photos = ''; var Docs = '';
									if( (Items[madeItems].photos!= null)&&(Items[madeItems].photos!= 0) ){
										for(var i = 0; i < (Items[madeItems].photos).split('<--->').length;i++){
											Photos += (Items[madeItems].photos).split('<--->')[i]+'\n';
										}
									}
									if( (Items[madeItems].docs!= null)&&((Items[madeItems].docs!= 0)) ){
										for(var i = 0; i < (Items[madeItems].docs).split('<--->').length;i++){
											Docs += ' \n'+(Items[madeItems].docs).split('<--->')[i]+'\n';
										}
									}		
									BotReply(ctx,'ID:'+Items[madeItems].workId+' \n ------------- \nПредмет: '+Items[madeItems].subject+' \n Тип работы: '+Items[madeItems].typeOfWork+' \n Задача: '+Items[madeItems].Task +' \nДедлайн:'+Items[madeItems].deadline+'\n Время начала работы:'+Items[madeItems].workTime+'\n Комментарий: '+Items[madeItems].comment+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos, Markup.keyboard([
										[
											Markup.button('Принять заказ id:'+Items[madeItems].workId, 'positive'),
											Markup.button('Получить информацию id:'+Items[madeItems].workId, 'primary')
										],
										[
											Markup.button('Отказаться id:'+Items[madeItems].workId, 'negative')
										]
									]).inline());
									setTimeout(function(){
										madeItems++;
										sendInfo();
									},300)
								}		
								else{
									BotReply(ctx,'Выберите следующее действие',Markup.keyboard(buttons));
									return;
								}		
							}
							sendInfo();	
						}
					}).catch(function(err){
						if(err == "Список пользователей пуст"){
							BotReply(ctx,'Нет доступных заказов.', Markup.keyboard(buttons));
						}
						else console.log('2521',err);

					})
				})
		}).catch(function(err){
			BotReply(ctx,'Список заказов пуст')
		});
	}).catch(function(err){
		BotReply(ctx,'Вы не являетесь исполнителем')
	});
});
bot.command('Ожидать id', (ctx) =>{
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(response){
		if((ctx.message.body).split(':')[1]!= undefined){	
			connection.query("update executor_"+user_Id+" set waitto ="+(ctx.message.body).split(':')[1],function(err,response){
				if(err) console.log("ERROR",err);
				else {
					BotReply(ctx,'Вы получите уведомление как только заказчик выйдет из чата.', Markup.keyboard([
						Markup.button('Список заказов','positive')
					]));
				}
			})
		}				
	}).catch(function(err){
		console.log(2572,err);
	})
})
bot.command('Получить информацию id', (ctx) =>{
	var user_Id = ctx.message.user_id;
	var Status = '';var Executor = ''; var Price = ''; var executorPrice = '';
	var message = '';
	if((ctx.message.body).split(':')[1]!= undefined){
		searchByWorkId((ctx.message.body).split(':')[1]).then(function(response){
			console.log('/////////////Получить информацию id: '+(ctx.message.body).split(':')[1]+'//////////',response);
			var Photos = ''; var Docs = ''; let whoIsAccepted = response[0].whoIsAccepted;
			if( (response[0].photos!= null)&&(response[0].photos!= 0) ){
				for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
					Photos += (response[0].photos).split('<--->')[i]+'\n';
				}
			}
			if( (response[0].docs!= null)&&((response[0].docs!= 0)) ){
				for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
					Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
				}
			}			
			if(response[0].status == 'InProcessing'){
				Status= 'Ведется поиск исполнителя.';
			}
			else if(response[0].status == 'PriceSelected'){
				Status= 'Исполнитель указал цену.';
			}
			else if(response[0].status == 'waitToPriceResponse'){
				Status= 'Вы назначили цену. Ожидаем ответа..';
			}
			else if(response[0].status == 'Paid'){
				Status= 'Оплачен';
			}
			else if(response[0].status == 'Completed'){
				Status= 'Завершен';
			}
			else if(response[0].status == 'Declined'){
				Status= 'Отклонен';
			}
			else Status = response[0].status;			
			if((response[0].executor != null)&&(response[0].executor != 0)){
				Executor = 'Найден';
			}
			else{
				Executor = 'Отсутствует';
			}
			if((response[0].price != null)&&(response[0].price != 0)){
				Price = response[0].price;
			}
			else{
				Price = 'Не назначена';
			}
			if((response[0].executorPrice != null)&&(response[0].executorPrice != 0)){
				executorPrice = response[0].executorPrice;
			}
			else{
				executorPrice = 'Не назначена';
			}	
			isAdmin(user_Id).then(function(){				
				if((response[0].executor != null)&&(response[0].executor != 0)){
					let executorStartPrice = '';	let priceMarkup = '';
					if( (response[0].executorStartPrice != null)&&(response[0].executorStartPrice != 0) ){
						for(let i =0; i < response[0].executorStartPrice.split(',').length;i++){
							console.log((response[0].executorStartPrice.split(',')[i]).split('_')[1],response[0].executor);
							if( (response[0].executorStartPrice.split(',')[i]).split('_')[1] == response[0].executor ){
								executorStartPrice = (response[0].executorStartPrice.split(',')[i]).split('_')[0];
								console.log(i,executorStartPrice);
								break;
							}
						}
					}	
					else executorStartPrice	= 'Отсутствует';	
					if( (response[0].priceMarkup != null)&&(response[0].priceMarkup != 0) ){
						for(let i =0; i < response[0].priceMarkup.split(',').length;i++){
							if( (response[0].priceMarkup.split(',')[i]).split('_')[1] == response[0].executor ){
								priceMarkup = (response[0].priceMarkup.split(',')[i]).split('_')[0];
								break;
							}
						}
					}
					else priceMarkup = 'Отсутствует';
					message = 'Информация по заказу ID:'+response[0].workId+' \n ------------- \nИсполнитель: https://vk.com/id'+response[0].executor+'\nПредмет: '+response[0].subject+'\nНачальная цена:'+executorStartPrice+'\nЦена с наценкой:'+priceMarkup+'\n Предмет: '+response[0].subject+' \n Тип работы: '+response[0].typeOfWork+' \n Задача: '+response[0].Task +' \nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+'\n Статус: '+Status+'\n Цена: '+Price+'\n Цена исполнителя: '+executorPrice+'\n Исполнитель: '+Executor+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos;
					if(Status == 'Отклонен'){
						if( (response[0].chat != null)&&(response[0].chat != 0) ){
							let chatID = response[0].chat;
							let peerID = 2000000000+chatID;
							console.log(chatID);			
							EASYBOTVK.call('messages.getInviteLink', {
								peer_id: peerID,
								group_id:148975156,
							}).then(function(chatLink){
								message += '\n\n\n------------\nСсылка на беседу:\n'+chatLink.link;								
								BotReply(ctx,message,
								Markup.keyboard([
									[
										Markup.button('Главное меню', 'positive')
									]
								]).oneTime());	
							}).catch(function(err){
								console.log(err);
							})
						}
						else{
							console.log(response[0].chat);
							BotReply(ctx,message,Markup.keyboard([
								[
									Markup.button('Главное меню', 'positive')
								]
							]).oneTime());	
						}
					}
					else{
						databaseRequest("select userChatId,executorChatId from chatList where workId="+response[0].workId).then(function(response){
							if(response != ''){
								let chatID = response[0].userChatId;
								let peerID = 2000000000+chatID;	

								let executorChatId = response[0].executorChatId;	
								EASYBOTVK.call('messages.getInviteLink', {
									peer_id: peerID,
									group_id:148975156,
								}).then(function(chatLink){
									message += '\n\n\n------------\nСсылка на беседу:\n'+chatLink.link;
									if( (executorChatId)&&(executorChatId) ){
										EASYBOTVK.call('messages.getInviteLink', {
											peer_id: peerID,
											group_id:148975156,
										}).then(function(ExecutorchatLink){
											message += '\n\n\n------------\nСсылка на беседу исполнителя:\n'+ExecutorchatLink.link;
											BotReply(ctx,message,
											Markup.keyboard([
												[
													Markup.button('Главное меню', 'positive')
												]
											]).oneTime());	
										})
									}
									else{
										BotReply(ctx,message,null,
										Markup.keyboard([
											[
												Markup.button('Главное меню', 'positive')
											]
										]).oneTime());	
									}
								
									
								}).catch(function(err){
									console.log(err);
								})
							}
							else{
								BotReply(ctx,message,
								Markup.keyboard([
									[
										Markup.button('Главное меню', 'positive')
									]
								]).oneTime());
							}
	  																													
						})	
					}					
				}
				else {
					message = 'Информация по заказу ID:'+response[0].workId+' \n ------------- \nПредмет: '+response[0].subject+' \n Тип работы: '+response[0].typeOfWork+' \n Задача: '+response[0].Task +' \nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+'\n Статус: '+Status+'\n Цена: '+Price+'\n Цена исполнителя: '+executorPrice+'\n Исполнитель: '+Executor+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos;
					if(Status == 'Отклонен'){
						BotReply(ctx,message,
						Markup.keyboard([
							[
								Markup.button('Главное меню', 'positive')
							]
						]).oneTime());	
					}
					else{
						databaseRequest("select userChatId from chatList where workId="+response[0].workId).then(function(response){
	  						let chatID = response[0].userChatId;
							let peerID = 2000000000+chatID;			
							EASYBOTVK.call('messages.getInviteLink', {
								peer_id: peerID,
								group_id:148975156,
							}).then(function(chatLink){
								message += '\n\n\n------------\nСсылка на беседу:\n'+chatLink.link;
							
								BotReply(ctx,message,
								Markup.keyboard([
									[
										Markup.button('Главное меню', 'positive')
									]
								]).oneTime());	
							}).catch(function(err){
								console.log(err);
							})																							
						})	
					}
				}				
			}).catch(function(){
				let executorStartPrice = '';
				if( (response[0].executorStartPrice != null)&&(response[0].executorStartPrice != 0) ){
					for(let i =0; i < response[0].executorStartPrice.split(',').length;i++){
						if( (response[0].executorStartPrice.split(',')[i]).split('_')[1] == user_Id){
							executorStartPrice = (response[0].executorStartPrice.split(',')[i]).split('_')[0];
							break;
						}
					}					
				}	
				else executorStartPrice = 'Не указана';		
				let workId = response[0].workId; console.log(3384,workId);
				message = 'Информация по заказу ID:'+response[0].workId+' \n ------------- \nПредмет: '+response[0].subject+' \n Тип работы: '+response[0].typeOfWork+' \n Задача: '+response[0].Task +' \nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+'\n Статус: '+Status+'\n Цена: '+Price+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos;
				isExecutor(user_Id).then(function(){
					if(Status != 'Отклонен'){
						databaseRequest("select executorChatId from chatList where workId="+workId).then(function(response){
							console.log(3388,'информация по заказу',response);
	  						let chatID = response[0].executorChatId;
							let peerID = 2000000000+chatID;	
							if( (chatID != null)&&(chatID != 0) ){
								EASYBOTVK.call('messages.getInviteLink', {
									peer_id: peerID,
									group_id:148975156,
								}).then(function(chatLink){
									if( (Status == 'Завершен')||(Status == 'Отклонен') ){
										BotReply(ctx,message);
									}
									else{
										BotReply(ctx,message+'\n\nСсылка на беседу:\n'+chatLink.link);
									}	
									BotReply(ctx,'Выберите следующее действие',Markup.keyboard([
										[
											Markup.button('В процессе', 'primary')
										],
										[
											Markup.button('Завершенные', 'positive')
										],
										[
											Markup.button('Главное меню', 'positive')
										]
									]));
								}).catch(function(err){
									console.log(err);
								})
							}
							else{
								if( (Status == 'Завершен')||(Status == 'Отклонен') ){
									BotReply(ctx,message,Markup.keyboard([
										[
											Markup.button('Главное меню', 'positive')
										]
									]).oneTime());								
								}
								else{
									console.log(whoIsAccepted);
									if( whoIsAccepted != null ){
										if( whoIsAccepted.split(',').includes(user_Id,0)||(whoIsAccepted == user_Id) ){
											BotReply(ctx,message);
										}
										else{
											BotReply(ctx,message,Markup.keyboard([
												[
													Markup.button('Принять заказ id:'+workId, 'positive')
												]
											]).inline());
										}
									}
									else{
										BotReply(ctx,message,Markup.keyboard([
											[
												Markup.button('Принять заказ id:'+workId, 'positive')
											]
										]).inline());
									}
									BotReply(ctx,'Выберите следующее действие',Markup.keyboard([
										[
											Markup.button('В процессе', 'primary')
										],
										[
											Markup.button('Завершенные', 'positive')
										],
										[
											Markup.button('Главное меню', 'positive')
										]
									]));						
								}							
							}
						})			
					}
					else{
						BotReply(ctx,message,Markup.keyboard([
							Markup.button('Главное меню','positive')
						]))
					}		
				}).catch(function(err){
					if( (response[0].chat != null)&&(response[0].chat != 0) ){
						let messagesChatID = response[0].chat;
						let messagesPeerID = 2000000000+messagesChatID;						
						EASYBOTVK.call('messages.getInviteLink', {
							peer_id: messagesPeerID,
							group_id:148975156,
						}).then(function(chatLink){
							message = 'Информация по заказу ID:'+response[0].workId+' \n ------------- \nПримерная цена:'+executorStartPrice+'\n Предмет: '+response[0].subject+' \n Тип работы: '+response[0].typeOfWork+' \n Задача: '+response[0].Task +' \nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+'\n Статус: '+Status+'\n Цена: '+Price+'\n Исполнитель: '+Executor+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos+'\n\n\n------------\nСсылка на беседу:'+chatLink.link;
							BotReply(ctx,message,Markup.keyboard([
								[
									Markup.button('Главное меню', 'positive')
								]
							]));
						})							
					}	
					else{
						message = 'Информация по заказу ID:'+response[0].workId+' \n ------------- \nПримерная цена:'+executorStartPrice+'\n Предмет: '+response[0].subject+' \n Тип работы: '+response[0].typeOfWork+' \n Задача: '+response[0].Task +' \nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+'\n Статус: '+Status+'\n Цена: '+Price+'\n Исполнитель: '+Executor+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos;
						BotReply(ctx,message,null,
						Markup.keyboard([
							[
								Markup.button('Главное меню', 'positive')
							]
						]).oneTime())
					}		
				})			
			})	
		}).catch(function(err){
			if(err == 'not-found'){
				BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[1] +' не найдено.')
			}
			else if(err == "workId doesn't exist"){
				BotReply(ctx,'Не указан ID')
			}
			else{
				console.log(3703,err);
			}
		})		
	}
	else{
		BotReply(ctx,'Ошибка команды', Markup.keyboard([
		[
			Markup.button('Список заказов', 'positive'),
		]
		]).oneTime());
	}	
})
bot.command('Пропустить', (ctx) =>{	
	var user_Id = ctx.message.user_id;
	isExecutor(user_Id).then(function(){
		selectUser(user_Id).then(function(response){
			if( (response[0].chat != 0)&&((response[0].chat != null)) ){
				let workID = response[0].chat;					
				databaseRequest("update executorList set chat=0,waitto="+workID+",chatMessage='"+ctx.message.body+"' where id="+user_Id).then(function(){
					databaseRequest("select commentFromExecutorWhenOrderIsAccepted from userList where workId="+workID).then(function(response){
						let comments = response[0].commentFromExecutorWhenOrderIsAccepted;
						if( (comments != null)&&(comments != 0) ){
							comments += ',Не указан_'+user_Id;
						}
						else comments = 'Не указан_'+user_Id;
						databaseRequest("update userList set commentFromExecutorWhenOrderIsAccepted='"+comments+"' where workId="+workID).then(function(){
							BotReply(ctx,'Укажите примерную стоимость.')
						})	
					})
				})
			}
		})
	}).catch(function(){
		selectUser(user_Id).then(function(response){
			if(response[0].status == 'TaskSelected'){
				let count = 0;			
				console.log("поиск workID");
				function searchWorkID(id){	
					console.log("ищу: "+id);										
					databaseRequest("select id from userList where workId="+id).then(function(response){
						if(response!='') {
							id++;
							searchWorkID(id)
						}
						else{
							console.log("3520 workID: "+id);
							count =  id;
							databaseRequest("update userList set workId ="+count+" ,status ='setDeadline' where id="+user_Id+" and orderFinished=0").then(function(){
								BotReply(ctx,'Укажите дату дедлайна по примеру: 6.08. Если не знаете, то сможете в дальнейшем уведомить исполнителя.', Markup.keyboard([
									[
										Markup.button('Сегодня', 'primary'),
										Markup.button('Завтра', 'primary'),
									],
									[
										Markup.button('Через неделю', 'primary'),
										Markup.button('Через месяц', 'primary'),
									],
									[
										Markup.button('Другая', 'default'),
										Markup.button('Не знаю', 'default'),
									],
									[
										Markup.button('Пропустить','default')
									]
								]).oneTime());
							})	
						}
					})
				}		
				searchWorkID(count);
			}
			else if(response[0].status == 'setDeadline' ){
				databaseRequest('update userList set deadline = "Не указан", status="setWorkTime" where id='+user_Id+" and orderFinished=0").then(function(){							
					BotReply(ctx,'Укажите время начала работы (по Москве) по примеру: 8:30', Markup.keyboard([
						[
							Markup.button('Идет сейчас!', 'positive'),
						],
						[
							Markup.button('Не знаю','negative')
						],
						[
							Markup.button('Отменить заказ', 'negative')
						],
						[
							Markup.button('Главное меню', 'positive')
						]
					]).oneTime());
				}).catch(function(err){
					console.log(2158,err);
				})
			}
		})		
	})
})
bot.command('Принять заказ id', (ctx) =>{
	var user_Id = ctx.message.user_id;
	if((ctx.message.body).split(':')[1]!= undefined){
		searchByWorkId((ctx.message.body).split(':')[1]).then(function(response){
			let workId = response[0].workId;
			if( (response[0].executor == null)||(response[0].executor == 0) ){
				databaseRequest("update executorList set chat ="+response[0].workId+" where id="+user_Id).then(function(){
					databaseRequest("select whoIsAccepted from userList where workId="+response[0].workId).then(function(response){
						let whoIsAccepted = '';
						if( response[0].whoIsAccepted != null ) whoIsAccepted += ','+user_Id;
						else whoIsAccepted += user_Id;
						databaseRequest("update userList set whoIsAccepted ='"+whoIsAccepted+"' where workId="+workId).then(function(){
							BotReply(ctx,'Оставьте комментарий к заказу',Markup.keyboard([
								Markup.button('Пропустить','default')
							]))
						})	
					}) })
			}
			else{
				BotReply(ctx,'У заказа уже есть исполнитель',Markup.keyboard([
					Markup.button('Главное меню','positive')
				]))
			}		
		}).catch(function(err){
			if(err == 'not-found'){
				BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[1] +' не найдено.')
			}
			else if(err == "workId doesn't exist"){
				BotReply(ctx,'Не указан ID')
			}
			else{
				console.log(3531,err);
			}
		})
	}
	else{
		if((ctx.message.body).split(':')[1] = 'undefined'){
			BotReply(ctx,'Ошибка команды. Возможно вы имели ввиду', Markup.keyboard([
			[
				Markup.button('Принять заказ id:'+(ctx.message.body).split(':')[1], 'positive')
			]
			]).oneTime())
		}
		else{
			BotReply(ctx,'Ошибка команды.', Markup.keyboard([
			[
				Markup.button('список команд', 'positive')
			]
			]).oneTime())
		}
	}	
})
bot.command('Авторизация', (ctx) =>{
	var user_Id = ctx.message.user_id;	
	isAdmin(user_Id).then(function(response){
		isAuthorized = false;
		connection.connect(function(err){
		    if (err) {
		      return console.error("Ошибка: " + err.message);
		    }
		    else{
		    	BotReply(ctx,'Подключение к базе установлено. Попытка авторизации менеджера');
					easyvk({
					  username:'',
					  password :'',
					  captchaHandler: captchaHandler,
					  reauth: true
					}).then(async manager => { 
						EASYMANAGERVK = manager;
						BotReply(ctx,'Менеджер авторизован,попытка бота');
						easyvk({
						  username:'',
						  password :'',
						  captchaHandler: captchaHandler,
						  reauth: true,
						  mode: 'highload', // Самая простая настройка
						  mode: {
							name: 'highload',

							// Каждые 15 МС вся очередь гарантированно будет выполняться (точнее читайте ниже)
							timeout: 15
						  }
						}).then(async vk => {
							EASYVK = vk;	
							isAuthorized = true;
							BotReply(ctx,'Успех');				
						}).catch(function(err){
							BotReply(ctx,'3642 ошибка авторизации');	
						})			
					})	
		    	let dateNow =new Date; //(new Date).timezoneOffset(-300);
				let nowDate = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear()+'-'+dateNow.getHours()+'-'+dateNow.getMinutes()+'-'+dateNow.getSeconds();
		      	console.log("Подключение к серверу MySQL восстановлено "+nowDate);
		    }
		}); 
	}).catch(function(err){
		BotReply(ctx,'Отказ '+err);
	})
})
bot.command('Всем исполнителям', (ctx) =>{
	var user_Id = ctx.message.user_id;	
	isAdmin(user_Id).then(function(response){
		databaseRequest("update grandadmin set massMessageto='executors' where id="+user_Id).then(function(response){						
			BotReply(ctx,'Введите сообщение')
		})
	}).catch(function(err){
		BotReply(ctx,'Отказ '+err);
	})
})
/*bot.command('Отклонить id', (ctx) =>{
	var user_Id = ctx.message.user_id;
	if((ctx.message.body).split(':')[1] = 'undefined'){
		searchByWorkId((ctx.message.body).split(':')[1]).then(function(response){
			databaseRequest("update executorList set chat = 0 where id="+user_Id)
		})
	}
})*/
bot.event('message_new', (ctx) => {
	console.log('message_new');
	var user_Id = ctx.message.user_id;	
	isAdmin(user_Id).then(function(){	
		if(isAuthorized == false){
				let captcha = ctx.message.body;
				Solve(captcha).then(() => {
					bot.sendMessage(331658531, 'Авторизовались');
				}).catch(({err, reCall: tryNewCall}) => {

				  // Иначе капча не решена, стоит попробовать снова
				  bot.sendMessage(331658531, 'Капча не решена');

			  tryNewCall() // Пробуем снова, занова запускаем наш captchaHandler, по факту...

			  // Не стоит самостоятельно перезапускать функцию captchaHandler, так как в EasyVK
			  // для этого имеется функция reCall, которая точно запустит все как нужно

			})
		}	
		else{
			databaseRequest("select * from grandadmin where id="+user_Id).then(function(response){
				let setSideTo = response[0].setSideTo; let setPriceTo = response[0].priceto; let massMessageto = response[0].massMessageto;
				if((setSideTo != null)&&((setSideTo != 0))){
					if((ctx.message.body).split('https://vk.com/')[1]!= undefined){
						EASYVK.call('users.get', {
							user_ids:(ctx.message.body).split('https://vk.com/')[1],
						}).then(function(resp){
							console.log((ctx.message.body).split('https://vk.com/')[1],resp);
							databaseRequest("select subject from executorList where id="+resp[0].id).then(function(response){
								if((response == '')||(response[0].subject == null)){
									databaseRequest('select id from executorList').then(function(response){
										let count = 0;
										if(response[0]!= undefined) count = response.length;
										databaseRequest("insert executorList (id,executor_id) values("+resp[0].id+","+count+")").then(function(){
											databaseRequest("update grandadmin set setSideTo=0,setworktypeto = "+resp[0].id+" where id="+user_Id).then(function(){
												BotReply(ctx,'Выберите предмет для исполнителя.\n'+subjectList, Markup.keyboard([[
													Markup.button('список исполнителей', 'positive')
												]
												]).oneTime())

											})
										})
									})								
								}
								else{
									let executor = response[0].setworktypeto;
									var subjects = '';
									if( (response[0]!= undefined)&&((response[0].subject).split(',').length = 1)){
										for(var i =0; i< (response[0].subject).split(',').length;i++){
											subjects += (response[0].subject).split(',')[i]+' ';
										}
									}
									else{
										subjects = response[0].subject;
									}
									databaseRequest("update grandadmin set setworktypeto = 0 where id="+user_Id).then(function(){
										BotReply(ctx,'Исполнитель https://vk.com/'+(ctx.message.body).split('https://vk.com/')[1]+' уже назначен на предмет(ы): '+subjects +'. \n Добавить еще?',Markup.keyboard([
											[
												Markup.button('добавить https://vk.com/'+(ctx.message.body).split('https://vk.com/')[1], 'primary'),
											]
										]).oneTime());
									})
								}
							})						
						}).catch(function(err){
							console.log(err);
						})
					}
					else{
						BotReply(ctx,'Некорректная ссылка')
					}
				}		
				else if (massMessageto != null){
					if(massMessageto == 'executors'){
						databaseRequest("update grandadmin set massMessageto = null where id="+user_Id).then(function(){
							databaseRequest("select id from executorList").then(function(response){
								var photos = ''; var docs = '';
								if(ctx.message.attachments != undefined){						
									for(var i =0;i < ctx.message.attachments.length;i++){
										if(ctx.message.attachments[i].photo!= undefined)photos += ctx.message.attachments[i].photo['photo_604']+'\n';
										if(ctx.message.attachments[i].doc!= undefined) docs += ctx.message.attachments[i].doc['url']+'\n';
									}
								}
								let executors = [];
								for(let i =0 ; i < response.length;i++)executors.push(response[i].id);
								bot.sendMessage( [...new Set([...executors ,...specIDs])],ctx.message.body+'\n\nВложения:\n'+photos+docs);
							})
						})					
					}				
				}
				else{
					selectUser(user_Id).then(function(response){
						if( (response[0].chat != 0)&&((response[0].chat != null)) ){
							let workID = response[0].chat;
							databaseRequest("update executorList set chat=0,waitto="+workID+",chatMessage='"+ctx.message.body+"' where id="+user_Id).then(function(){
								BotReply(ctx,'Укажите примерную стоимость.')
							})	
						}
						else if( (response[0].waitto != 0)&&((response[0].waitto != null)) ){
							BotReply(ctx,'Укажите примерную стоимость числом!.')
						}
						else{
							BotReply(ctx,"С возвращением", Markup.keyboard([						
								[
									Markup.button('Мои заказы', 'positive')
								],
								[
									Markup.button('Список заказов', 'primary'),
								],
								[
									Markup.button('Открытые споры', 'negative'),
								],
							]).oneTime());
						}
					}).catch(function(err){
						if(err =="isEmpty"){
							BotReply(ctx,"С возвращением", Markup.keyboard([						
								[
									Markup.button('Мои заказы', 'positive')
								],
								[
									Markup.button('Список заказов', 'primary'),
								],
								[
									Markup.button('Открытые споры', 'negative'),
								],
							]).oneTime());
						}
						else console.log(2831,err);
					})	
				}	
			})
		}
		//админ
	}).catch(function(){
		isExecutor(user_Id).then(function(response){
			selectUser(user_Id).then(function(response){
				if( (response[0].chat != 0)&&((response[0].chat != null)) ){
					let workID = response[0].chat;
					databaseRequest("update executorList set chat=0,waitto="+workID+",chatMessage='"+ctx.message.body+"' where id="+user_Id).then(function(){
						databaseRequest("select commentFromExecutorWhenOrderIsAccepted from userList where workId="+workID).then(function(response){
							let comments = response[0].commentFromExecutorWhenOrderIsAccepted;
							if( (comments != null)&&(comments != 0) ){
								comments += ','+ctx.message.body+'_'+user_Id;
							}
							else comments = ctx.message.body+'_'+user_Id;
							databaseRequest("update userList set commentFromExecutorWhenOrderIsAccepted='"+comments+"' where workId="+workID).then(function(){
								BotReply(ctx,'Укажите примерную стоимость.',Markup.keyboard([
									Markup.button('Главное меню', 'positive')
								]))
							})	
						})											
					})	
				}
				else if( (response[0].waitto != 0)&&((response[0].waitto != null)) ){
					BotReply(ctx,'Укажите примерную стоимость числом!.')
				}
				else{
					BotReply(ctx,"С возвращением", Markup.keyboard([						
						[
							Markup.button('Мои заказы', 'positive')
						],
						[
							Markup.button('Список заказов', 'primary'),
						],
						[
							Markup.button('Открытые споры', 'negative'),
						],
					]).oneTime());
				}
			}).catch(function(err){
				if(err =="isEmpty"){
					BotReply(ctx,"С возвращением", Markup.keyboard([						
						[
							Markup.button('Мои заказы', 'positive')
						],
						[
							Markup.button('Список заказов', 'primary'),
						],
						[
							Markup.button('Открытые споры', 'negative'),
						],
					]).oneTime());
				}
				else console.log(2831,err);
			})	
			//исполонитель
		}).catch(function(){
			selectUser(user_Id).then(function(response){
				if(response[0].askQuestion != 1){
					if(ctx.message.attachments != undefined){
						if (response[0].status == 'TaskSelected'){						
							databaseRequest("select id from userList").then(function(response){
								let count = 0;
								if(response[0]!= undefined) count = response.length;
								databaseRequest("update userList set workId ="+count+" ,status ='setDeadline' where id="+user_Id+" and orderFinished=0").then(function(){
									function searchWorkID(id){
										databaseRequest("select id from userList where workId="+id).then(function(response){
											if(response!='') {
												id++;
												searchWorkID(id)
											}
											else{
												console.log("workID: "+id);
												count =  id;
												var photos = ''; var docs = '';
												for(var i =0;i < ctx.message.attachments.length;i++){
													if(ctx.message.attachments[i].photo!= undefined)photos += ctx.message.attachments[i].photo['photo_604']+'<--->';
													if(ctx.message.attachments[i].doc!= undefined) docs += ctx.message.attachments[i].doc['url']+'<--->';
												}	
												databaseRequest("update userList set photos='"+photos+"',docs ='"+docs+"',workId ="+count+" ,status ='setDeadline' where id="+user_Id+" and orderFinished=0").then(function(){
													BotReply(ctx,'Укажите дату дедлайна по примеру: 6.08. Если не знаете, то сможете в дальнейшем уведомить исполнителя.', Markup.keyboard([
														[
															Markup.button('Сегодня', 'primary'),
															Markup.button('Завтра', 'primary'),
														],
														[
															Markup.button('Через неделю', 'primary'),
															Markup.button('Через месяц', 'primary'),
														],
														[
															Markup.button('Другая', 'default'),
															Markup.button('Не знаю', 'default'),
														],
														[
															Markup.button('Пропустить', 'default')
														],
														[
															Markup.button('Отменить заказ', 'negative')
														]
													]).oneTime());
												})
											}
										})
									}	
									searchWorkID(count);
								})																					
							})
						} 	
						else{
							console.log(response[0].workId,'Статус не TaskSelected');
							BotReply(ctx,'Я не понимаю тебя.')
						}	
					}
					else{
							if(response[0].status == 'TaskSelected'){
								BotReply(ctx,'Комментарий к заказу сможете оставить дальше. Прикрепите все документы и фотографии, относящиеся к заданию, или пример билета, который вам встретится, чтобы мы могли оценить работу.\n\nP.s. Если у вас нет документов, нажмите "пропустить"', Markup.keyboard([
									[
										Markup.button('Пропустить', 'default')
									],
									[
										Markup.button('Отменить заказ', 'negative')
									]
								]).oneTime());
							}
							if(response[0].chatStatus == 'WaitsResponse'){
								var photos = ''; var Docs = ''; var userMessage = ctx.message.body;
								for(var i =0;i < ctx.message.attachments.length;i++){
									if(ctx.message.attachments[i].photo!= undefined)photos += ctx.message.attachments[i].photo['photo_604']+'\n';
									if(ctx.message.attachments[i].doc!= undefined) Docs +=ctx.message.attachments[i].doc['url'];
								}
								bot.sendMessage(response[0].chat, '&#128100; '+userMessage+' \n ----------------- \n Фото:'+photos+' \n Документы:'+Docs)
							}
							else if (response[0].status == 'WaitsComment'){
								databaseRequest("update userList set comment = '"+ctx.message.body+"',status = 'getSuccess' where id="+user_Id+" and orderFinished=0").then(function(){
									databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
										BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
											[
												Markup.button('Подтвердить', 'positive'),
												Markup.button('Отменить заказ', 'negative')
											],
											[
												Markup.button('Изменить заказ', 'default')
											]
										]).oneTime());
									})	
								})	
							}
							else if(response[0].status == 'setDeadline'){
								selectUser(user_Id).then(function(response){
									if( (response[0].comment !=null)&&(response[0].comment !=0) ){
										databaseRequest('update userList set deadline = "'+ctx.message.body+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){							
											databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
												BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
													[
														Markup.button('Подтвердить', 'positive'),
														Markup.button('Отменить заказ', 'negative')
													],
													[
														Markup.button('Изменить заказ', 'default')
													]
												]).oneTime());
											})	
										}).catch(function(err){
											console.log(2158,err);
										})									
									}
									else{
										databaseRequest('update userList set deadline = "'+ctx.message.body+'" where id='+user_Id+" and orderFinished=0").then(function(){							
											BotReply(ctx,'Указать дедлайн: '+ctx.message.body+'?', Markup.keyboard([
												[
													Markup.button('Подтвердить', 'positive'),
													Markup.button('Отменить заказ', 'negative')
												],
												[
													Markup.button('Изменить заказ', 'default')
												]
											]).oneTime());
										}).catch(function(err){
											console.log(2158,err);
										})	
									}
								})								
							}
							else if(response[0].status == 'setWorkTime'){
								selectUser(user_Id).then(function(response){
									if( (response[0].comment !=null)&&(response[0].comment !=0) ){
										databaseRequest('update userList set workTime = "'+ctx.message.body+'", status="getSuccess" where id='+user_Id+" and orderFinished=0").then(function(){							
											databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
												BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+ctx.message.body+'\nКомментарий:'+response[0].comment, Markup.keyboard([
													[
														Markup.button('Подтвердить', 'positive'),
														Markup.button('Отменить заказ', 'negative')
													],
													[
														Markup.button('Изменить заказ', 'default')
													]
												]).oneTime());
											})	
										}).catch(function(err){
											console.log(2158,err);
										})									
									}
									else{
										databaseRequest('update userList set workTime = "'+ctx.message.body+'" where id='+user_Id+" and orderFinished=0").then(function(){							
											BotReply(ctx,'Указать время работы: '+ctx.message.body+'?', Markup.keyboard([
												[
													Markup.button('Подтвердить', 'positive'),
													Markup.button('Отменить заказ', 'negative')
												],
												[
													Markup.button('Изменить заказ', 'default')
												]
											]).oneTime());
										}).catch(function(err){
											console.log(2158,err);
										})	
									}
								})								
							}
							else if(response[0].status == 'selectingObject'){
								selectUser(user_Id).then(function(response){
									if( (response[0].comment !=null)&&(response[0].comment !=0) ){
										databaseRequest('update userList set subject = "'+ctx.message.body+'", status="ObjectSelected" where id='+user_Id+" and orderFinished=0").then(function(){							
											databaseRequest('select * from userList where id='+user_Id+" and orderFinished=0").then(function(response){
												BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+ctx.message.body+'\nКомментарий:'+response[0].comment, Markup.keyboard([
													[
														Markup.button('Подтвердить', 'positive'),
														Markup.button('Отменить заказ', 'negative')
													],
													[
														Markup.button('Изменить заказ', 'default')
													]
												]).oneTime());
											})	
										}).catch(function(err){
											console.log(2158,err);
										})									
									}
									else{
										databaseRequest('update userList set subject = "'+ctx.message.body+'" ,status="ObjectSelected" where id='+user_Id+" and orderFinished=0").then(function(){							
											BotReply(ctx,'Указать предмет: '+ctx.message.body+'?', Markup.keyboard([
												[
													Markup.button('Подтвердить', 'positive'),
													Markup.button('Отменить заказ', 'negative')
												],
												[
													Markup.button('Изменить заказ', 'default')
												]
											]).oneTime());
										}).catch(function(err){
											console.log(2158,err);
										})	
									}
								})	
							}
							else if(response[0].status == 'ObjectSelected'){
								BotReply(ctx,'Выбери вид помощи', Markup.keyboard([
									[
										Markup.button('Контрольная работа/РК', 'primary'),
										Markup.button('Домашняя работа', 'primary'),
									],
									[
										Markup.button('Экзамен/Зачет', 'primary'),
										Markup.button('Курсовая работа', 'primary'),
									],
									[
										Markup.button('Реферат/Доклад/Отчет', 'primary'),
										Markup.button('Дипломная работа', 'primary')
									],
									[
										Markup.button('Лабораторная работа', 'primary'),
									],
									[
										Markup.button('Отменить заказ', 'negative')
									]
								]).oneTime());						
							}
							else if(response[0].status == 'getSuccess'){
								BotReply(ctx,'Ваш заказ:\nПредмет:'+response[0].subject+'\nТип работы:'+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\n Время начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment, Markup.keyboard([
									[
										Markup.button('Подтвердить', 'positive'),
										Markup.button('Отказаться', 'negative')
									],
									[
										Markup.button('Изменить заказ', 'default')
									]
								]).oneTime());
							}
							else if(response[0].status == 'Declined'){
								databaseRequest("select * from userList where status='Declined' and id="+user_Id+" and orderFinished=0").then(function(response){
									var message;
									if( (response[0].executor != null)&&(response[0].executor != 0) ){
										let executor = response[0].executor;
										message = 'Клиент отказался \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\nИсполнитель: https://vk.com/id'+executor+'\nСдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Причина: '+response[0].comment;
									}
									else{
										message = 'Клиент отказался \n  -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Причина: '+response[0].comment;
									}
									databaseRequest("update userList set orderFinished=1,comment='"+ctx.message.body+"' where id="+user_Id+" and orderFinished=0").then(function(){
										bot.execute('messages.send', {
										  random_id: randomInteger(0, 18446744073709551614),
										  chat_id: 8,
										  message: message
										})
										BotReply(ctx,'Спасибо за ваше содействие улучшению качества нашего сервиса. \n Вы всегда можете заново оформить заказ.')
									})
								})
							}
							if(response[0].status =='typeOfWorkSelected'){
								BotReply(ctx,'Выбери вид помощи', Markup.keyboard([
									[
										Markup.button('Прислать решение', 'primary'),
										Markup.button('Передать курьером', 'primary')
									],
									[
										Markup.button('Диктовка', 'primary'),
										Markup.button('Сдать за вас', 'primary'),
									],
									[
										Markup.button('Отработка', 'primary'),
										Markup.button('Нормативы', 'primary'),
									],
									[
										Markup.button('Отменить заказ', 'negative')
									]
								]).oneTime());		
							}
							else{
								console.log(2456,response[0].status);
							}	
					}
				}
			}).catch(function(err){
				if(err =="isEmpty"){
					BotReply(ctx,'Привет Наша команда готова помочь тебе с учебой. Тебе нужна помощь?', Markup.keyboard([
						[
							Markup.button('Заказать', 'positive'),
							Markup.button('В другой раз', 'negative')
						],
						[
							Markup.button('Задать вопрос', 'positive')
						],
						[
							Markup.button('Мои заказы', 'positive')
						]
					]).oneTime());											
				}
				else console.log(2831,err);
			})
			//пользователь
		})
	})
});
function pollRequest(body){
	if( (JSON.parse(body).updates != undefined)&&(JSON.parse(body).updates[0]!= undefined)){ 			
	 	let updatesOrderDetails = JSON.parse(body).updates;
	 	console.log(updatesOrderDetails);	
	 	for (var updateskey in updatesOrderDetails) {	 		
	        if (typeof updatesOrderDetails[updateskey] === 'object') {
	        	let value = updatesOrderDetails[updateskey];			        	
	        	if( ( value != undefined )&&( (value)[7] != undefined )&&((value)[7].from > 0) ){		
	        		console.log('Первое условие');        	
		        	let user_Id = parseInt((value)[7].from); let messagesWorkID = (value)[5].split(' ')[0];
		            if( (value)[7].hasOwnProperty('source_act') ){            	
		            	if( (value)[7].source_act == 'chat_title_update' ){
		            		let chatID = (value)[3]-2000000000;	
		            		let peerID = (value)[3];	
		            		let messagesID = parseInt(((value)[7].source_old_text).split('id:')[1]);
		            		let messagesPeerID = messagesID +2000000000;		
		            		bot.execute('messages.editChat', {
								chat_id: messagesID,
								title: (value)[7].source_old_text
							}).then(function(){}).catch(function(){})
							bot.execute('messages.send', {
								random_id: randomInteger(0, 18446744073709551614),
								peer_id: messagesPeerID,
								chat_id: messagesID,
								message: 'Название беседы хранит необходимую информацию для скорейшей помощи Вам. Не рекомендуется изменять его'
							}).then(function(){}).catch(function(){})
		            	}
		            	else if( (value)[7].source_act == 'chat_kick_user'){
				  			let user_Id = (value)[7].from;
				  			isExecutor(user_Id).then(function(){

				  			}).catch(function(){
				  				if( !specIDs.includes( parseInt(user_Id),0) ){
					  				databaseRequest("select workId,executorChatId from chatList where id="+user_Id+" and userChatID="+(value)[5].split('id:')[1] ).then(function(response){
							  			if( ( (response != '')&&response[0].workId != null)&&((response[0].workId != 0)) ){
							  				let workId = response[0].workId;
						  					let executorChatId = response[0].executorChatId;	
					  						let executorPeerID = 2000000000+executorChatId;
					  						databaseRequest("update userList set status='Declined',comment='Вышел из чата' where workId="+workId).then(function(){
					  							databaseRequest("delete from chatList where workId="+workId).then(function(){
					  								if( (executorChatId != null)&&(executorChatId != 0) ){					  							
														bot.execute('messages.send', {
														    random_id: randomInteger(0, 18446744073709551614),
															peer_id: executorPeerID,
															chat_id: executorChatId,
															message: 'Клиент с ID заказа: '+workId+' вышел из чата! Заказ был отменен.',
															group_id:148975156
														}).then(function(response){
															console.log(response);
														}).catch(function(err){
															console.log(err);
														})
							  						}
							  						bot.execute('messages.send', {
													    random_id: randomInteger(0, 18446744073709551614),
														chat_id: 7,
														message: 'Клиент с ID заказа: '+workId+' вышел из чата! Заказ был отменен.',
														group_id:148975156
													}).then(function(response){
														console.log(response);
													}).catch(function(err){
														console.log(err);
													})
					  							})					  							
					  						})						  				
							  			}
							  		})	
					  			}	
				  			})					  						  			
				  		}
		            	else{
					  		let user_Id = (value)[7].from;			  		
					  		if( !specIDs.includes( parseInt( user_Id ),0) ){ 					  						  			
					  			let messagesWorkID = (value)[5].split(' ')[0];
					  			console.log('here');
								databaseRequest("select * from userList where workId="+messagesWorkID).then(function(response){
					  				let chatID = response[0].chat;
									let peerID = 2000000000+chatID;
									let subject = response[0].subject;
									let executorID = response[0].executor;

										var message = '\nЗаказ:\n -----------------\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+' \n\nВложения: ';
										var Photos = ''; var Docs = '';
										if( (response[0].photos != 0)&&(response[0].photos != null) ){
											for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
												Photos += (response[0].photos).split('<--->')[i]+'\n';
											}
										}
										if( (response[0].docs != 0)&&(response[0].docs!= null) ){
											for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
												Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
											}
										}										
										isExecutor(user_Id).then(function(){ 			
											if( ((executorID == null)||(executorID == 0))||(executorID == user_Id) ){
												console.log(3747,executorID);							
												databaseRequest("update userList set executor ="+user_Id+" where workId="+messagesWorkID+" and orderFinished = 1").then(function(){
													databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
								  						let chatID = response[0].executorChatId;
														let peerID = 2000000000+chatID;
														console.log('Беседа: messagesWorkID. Исполнитель '+user_Id+' зашел в беседу');
														console.log('ChatID исполнителя: '+chatID);
														message = 'Исполнитель перешел в беседу зазказа.' + message;
														bot.execute('messages.send', {
														  random_id: randomInteger(0, 18446744073709551614),
														  peer_id: peerID,
														  chat_id: chatID,
														  message: message+Docs+' \n\n'+Photos,
														  keyboard: Markup.keyboard([
														  	[
														  		Markup.button('Получить информацию о заказе','primary')
														  	],
														  	[
														  		Markup.button('Указать стоимость','primary')
														  	],
														  	[
														  		Markup.button('Завершить заказ','positive')
														  	],
														  	[
														  		Markup.button('Вызвать менеджера','primary')
														  	]
														  ])
														}).then(function(response){
															//console.log(response);
														}).catch(function(err){
															console.log(3746,err);
														})									
													})	
												})	
											}		
								  			else{
								  				console.log('/////// '+user_Id+' У заказа уже есть исполнитель: '+ executorID);
								  				let kickChatID = parseInt((value)[5].split('id:')[1]);
												let kickPeerID = 2000000000+chatID;
												message = 'У данного заказа уже есть исполнитель. Далее эта беседа бесполезна, вы можете спокойно её покинуть.';
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  peer_id: kickPeerID,
												  chat_id: kickChatID,
												  message: message,
												}).then(function(response){
													//console.log(response);
												}).catch(function(err){
													console.log(3746,err);
												})	
								  			}				  					
							  			}).catch(function(){
							  				console.log("Заказчик "+user_Id+" перешёл в беседу заказа: "+messagesWorkID);
							  				message = 'Ваше задание находится в оценке специалистами. Пока что можете попить кофе, подождать наших предложений и выбрать лучшее. Как только вы одобрите одно из предложений, вы сможете общаться со специалистом прямо тут.\nНе выходите из беседы, иначе заказ закроется.\n &#10084;- пишет специалист\n\n\nВаш заказ:\n -----------------\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+' \n\nВложения: ';
							  				databaseRequest("update userList set userInChat=1 where status!='Declined' and status !='Completed' and workId="+messagesWorkID+" and userInChat is null").then(function(){
												Search(user_Id,messagesWorkID);
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  peer_id:peerID,
												  chat_id: chatID,
												  message: message+Docs+' \n\n'+Photos,
												  keyboard: Markup.keyboard([
												  	[
												  		Markup.button('Отменить заказ','negative')
												  	],
												  	[
												  		Markup.button('Вызвать менеджера','negative')
												  	]
												  ])
												}).then(function(response){
													//console.log(response);
												}).catch(function(err){
													//console.log(err);
												})									
											})	
							  			})									  						
								})
					  		}
				  		}
		            }
		            else{			            	
				  		if( (value)[7].payload != undefined ){ 
				  			if( !specIDs.includes( parseInt((value)[7].from),0) ){ 
				  				let user_Id = (value)[7].from;
				  				isExecutor(user_Id).then(function(){ 
				  					if( JSON.parse((value)[7].payload).button == 'Получить информацию о заказе' ){				  						
				  						var Status = ''; var Executor = ''; var message = '';
				  						searchByWorkId(messagesWorkID).then(function(response){
											var Photos = ''; var Docs = '';
											if(response[0].photos!= undefined){
												for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
													Photos += (response[0].photos).split('<--->')[i]+'\n';
												}
											}
											if(response[0].docs!= undefined){
												for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
													Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
												}
											}		
											let executorStartPrice = '';	let priceMarkup = '';
											if( (response[0].executorStartPrice != null)&&( response[0].executorStartPrice != 0 ) ){
												for(let i =0; i < response[0].executorStartPrice.split(',').length;i++){
													if( (response[0].executorStartPrice.split(',')[i]).split('_')[1] == user_Id){
														executorStartPrice = (response[0].executorStartPrice.split(',')[i]).split('_')[0];
														break;
													}
												}
											}
											else executorStartPrice = 'Не указана';
											
											if(response[0].status == 'InProcessing'){
												Status= 'Ведется поиск исполнителя.';
											}
											else if(response[0].status == 'PriceSelected'){
												Status= 'Исполнитель указал цену.';
											}
											else if(response[0].status == 'waitToPriceResponse'){
												Status= 'Вы назначили цену. Ожидаем ответа..';
											}
											else if(response[0].status == 'Paid'){
												Status= 'Оплачен.';
											}
											else if(response[0].status == 'Completed'){
												Status= 'Завершен.';
											}
											else Status = response[0].status;			
											if((response[0].executor != null)&&(response[0].executor != 0)){
												Executor = 'Найден';
											}
											else{
												Executor = 'Отсутствует';
											}
											let executorFinishPrice = response[0].executorPrice 
											if( (executorFinishPrice == null)||(executorFinishPrice == 0) ) executorFinishPrice = 'Не указана';
											
											message = 'Информация по заказу ID:'+response[0].workId+' \n ------------- \nПримерная цена:'+executorStartPrice+'\n Конечная цена:'+executorFinishPrice+' \nПредмет: '+response[0].subject+' \n Тип работы: '+response[0].typeOfWork+' \n Задача: '+response[0].Task +'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\n Комментарий: '+response[0].comment+'\n Документы: '+Docs +' \n\n Фотографии: '+Photos;
											
											databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
												let executorChatId = response[0].executorChatId;
												let executorPeerId = 2000000000+executorChatId;
												bot.execute('messages.send', {
												    random_id: randomInteger(0, 18446744073709551614),
													peer_id: executorPeerId,
													chat_id: executorChatId,
													message: message,
													group_id:148975156,
												}).then(function(response){
													console.log(response);
												}).catch(function(err){
													console.log(err);
												})
											})
										}).catch(function(err){
											if(err == 'not-found'){
												BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[1] +' не найдено.')
											}
											else if(err == "workId doesn't exist"){
												BotReply(ctx,'Не указан ID')
											}
											else{
												console.log(3703,err);
											}
										})		
				  					}
				  					if( JSON.parse((value)[7].payload).button == 'Указать стоимость' ){
				  						searchByWorkId( messagesWorkID ).then(function(response){
											databaseRequest("update executorList set setpriceto ="+response[0].id+" where id="+user_Id).then(function(){
												databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
													let executorChatId = response[0].executorChatId;
													let executorPeerId = 2000000000+executorChatId;
													bot.execute('messages.send', {
													    random_id: randomInteger(0, 18446744073709551614),
														peer_id: executorPeerId,
														chat_id: executorChatId,
														message: 'Укажите стоимость.',
														group_id:148975156,
													})
												})
											})
										})
				  					}
				  					if( JSON.parse((value)[7].payload).button == 'Завершить заказ' ){ 
				  						searchByWorkId( messagesWorkID ).then(function(response){
											databaseRequest("update userList set status ='Completed' where workId="+messagesWorkID).then(function(){
												databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
													let executorChatId = response[0].executorChatId;
													let executorPeerId = 2000000000+executorChatId;
													bot.execute('messages.send', {
													    random_id: randomInteger(0, 18446744073709551614),
														peer_id: executorPeerId,
														chat_id: executorChatId,
														message: 'Заказ был завершен. Укажите, как был закрыт заказ?',
														keyboard: Markup.keyboard([
														[
															Markup.button('Успешно', 'positive'),
															Markup.button('Безуспешно', 'negative')
														]
														]),
														group_id:148975156,
													})
												}).then(function(){}).catch(function(){})
											})
										})
				  					}
				  					if( JSON.parse((value)[7].payload).button == 'Успешно' ){
										searchByWorkId(messagesWorkID).then(function(response){
											var message = 'Заказ завершен. Мы были рады Вам помочь!\nА теперь, если вас не затруднит, оставьте пожалуйста нам отзыв.\nЗаранее спасибо\n https://vk.com/app6326142_-148975156';
											let userChatID = response[0].chat;
											let userPeerID = 2000000000+userChatID;
											
											databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
												let executorChatId = response[0].executorChatId;
												let executorPeerId = 2000000000+executorChatId;		

												bot.execute('messages.send', {
												    random_id: randomInteger(0, 18446744073709551614),
													peer_id:userPeerID,
													chat_id: userChatID,
													message: message,
													group_id:148975156,
												}).then(function(){}).catch(function(){})								

												bot.execute('messages.send', {
												    random_id: randomInteger(0, 18446744073709551614),
													peer_id:executorPeerId,
													chat_id: executorChatId,
													message: 'Спасибо за работу.',
													group_id:148975156,
												}).then(function(){}).catch(function(){})
											})
										})
				  					}
				  					if( JSON.parse((value)[7].payload).button == 'Безуспешно' ){
				  						databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
											let executorChatId = response[0].executorChatId;
											let executorPeerId = 2000000000+executorChatId;
											bot.execute('messages.send', {
											    random_id: randomInteger(0, 18446744073709551614),
												peer_id:executorPeerId,
												chat_id: executorChatId,
												message: 'Спасибо за работу.',
												group_id:148975156,
											}).then(function(){}).catch(function(){})
										})
				  					}	
				  					if( JSON.parse((value)[7].payload).button == 'Вызвать менеджера' ){
				  						let chatID = parseInt((value)[5].split('id:')[1]);
										let peerID = 2000000000+chatID;
										message = 'Исполнителю заказа с ID:'+messagesWorkID+' потребовался менеджер';							
										EASYBOTVK.call('messages.getInviteLink', {
											peer_id: peerID,
											group_id:148975156,
										}).then(function(chatLink){
											message += '\n\nСсылка на беседу заказа с ID: '+chatLink.link;
											bot.sendMessage(specIDs,message)

											bot.execute('messages.send', {
											  random_id: randomInteger(0, 18446744073709551614),
											  peer_id: peerID,
											  chat_id: chatID,
											  message: 'Менеджер оповещен. Скоро он свяжется с вами в этой беседе',
											  keyboard:Markup.keyboard([
											  	[
											  		Markup.button('Получить информацию о заказе','primary')
											  	],
											  	[
											  		Markup.button('Указать стоимость','primary')
											  	],
											  	[
											  		Markup.button('Завершить заказ','positive')
											  	],
											  	[
											  		Markup.button('Вызвать менеджера','primary')
											  	]
											  ])
											}).then(function(response){
												//console.log(response);
											}).catch(function(err){
												console.log(3746,err);
											})	
										})																						
				  					}  					
				  				}).catch(function(err){
						  			if( JSON.parse((value)[7].payload).button.split("Выбрать:")[1]!= undefined ){
						  				let executorID = JSON.parse((value)[7].payload).button.split("Выбрать:")[1];
						  				let messagesWorkID = (value)[5].split(' ')[0];
						  				console.log("Выбрать: "+executorID);
							  			databaseRequest("select chat,workId,subject,executor from userList where workId="+messagesWorkID).then(function(response){
							  				console.log(response);
							  				if( (response[0].executor != null)||(response[0].executor != 0) ){
							  					let chatID = response[0].chat;
												let peerID = 2000000000+chatID;
												let workId = response[0].workId;
												let subject = response[0].subject;														
												databaseRequest("select id from executorList where executor_id="+executorID).then(function(response){
													let executorProfileID = response[0].id;													
													databaseRequest('select * from userList where workId='+workId).then(function(response){
														let orderDetails = response;
														var message = 'Заказ\n -----------------\n ID: '+orderDetails[0].workId+'\n Сдаваемый предмет: '+orderDetails[0].subject+'\n Тип работы: '+orderDetails[0].typeOfWork +'\n Задача: '+orderDetails[0].Task+'\n Комментарий: '+orderDetails[0].comment+' \n\nВложения: ';
														var Photos = ''; var Docs = '';
														if(orderDetails[0].photos!= undefined){
															for(var i = 0; i < (orderDetails[0].photos).split('<--->').length;i++){
																Photos += (orderDetails[0].photos).split('<--->')[i]+'\n';
															}
														}
														if(orderDetails[0].docs!= undefined){
															for(var i = 0; i < (orderDetails[0].docs).split('<--->').length;i++){
																Docs += ' \n'+(orderDetails[0].docs).split('<--->')[i]+'\n';
															}
														}				
														EASYBOTVK.call('messages.createChat', {
															title: workId+' '+subject,
															group_id:148975156,
														}).then(function(createExecutorChat){
															let messagesChatID = createExecutorChat.getFullResponse().response;
															let messagesPeerID = 2000000000+messagesChatID;
															let editChat = EASYBOTVK.call('messages.editChat', {
																chat_id: messagesChatID,
																title: workId+' '+subject+' id:'+messagesChatID
															})
															databaseRequest("update chatList set executorId="+executorProfileID+",executorChatId="+messagesChatID+" where workId="+workId).then(function(){
																EASYBOTVK.call('messages.getInviteLink', {
																	peer_id: messagesPeerID,
																	group_id:148975156,
																}).then(function(chatLink){
																	EASYVK.call('messages.joinChatByInviteLink', {
																		link: chatLink.link,
																	}).then(function(chatJoin){
																		EASYMANAGERVK.call('messages.joinChatByInviteLink', {
																			link: chatLink.link,
																		}).then(function(){
																			bot.sendMessage(executorProfileID,'Вас выбрали исполнителем заказа #'+workId+'\nСсылка на беседу заказа: '+chatLink.link,null,Markup.keyboard([
																			[
																				Markup.button('Получить информацию id:'+workId, 'primary')
																			],
																			[
																				Markup.button('Отказаться id:'+workId, 'negative')
																			]
																			]).inline())
																			bot.execute('messages.send', {
																			  random_id: randomInteger(0, 18446744073709551614),
																			  peer_id: peerID,
																			  chat_id: chatID,
																			  message: 'Специалист с ID:'+executorID+' оповещён. Вскоре он свяжется с вами тут. Пока что вы можете выбрать другие предложения.',
																			}).then(function(response){
																				//console.log(response);
																			}).catch(function(err){
																				//console.log(err);
																			})
																		})																																				
																	})
																})																
															})	
														})	
													})									
												})
							  				}	
							  				else{
							  					let chatID = response[0].chat;
												let peerID = 2000000000+chatID;
												let workId = response[0].workId;
												let subject = response[0].subject;							
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  peer_id:peerID,
												  chat_id: chatID,
												  message: 'У заказа с ID:'+response[0].workId+' уже есть исполнитель'
												}).then(function(response){
													//console.log(response);
												}).catch(function(err){
													//console.log(err);
												})
							  				}				  				
							  			})				  				
						  			}
						  			if( JSON.parse((value)[7].payload).button == 'Согласиться' ){ 
						  				let messagesWorkID = (value)[5].split(' ')[0];
						  				databaseRequest("select * from userList where workId="+messagesWorkID).then(function(response){
						  					if((response[0].Task == 'Диктовка')||(response[0].Task == 'Сдать за вас')||(response[0].Task == 'Передать курьером')){
												var message = 'Клиент готов оплатить \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task;
											}
											else if((response[0].typeOfWork == 'Лабораторная работа')||(response[0].Task == 'Отработка')||(response[0].Task == 'Нормативы')){
												var message = 'Клиент готов оплатить \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task;
											}
											else{
												var message = 'Клиент готов оплатить \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task;
											}
											let Price = response[0].price;
											databaseRequest("update userList set status='PriceSuccess' where workId="+messagesWorkID).then(function(response){
												databaseRequest("select id from grandadmin where id="+specIDs[1]).then(function(response){
													let admin_Id = response[0].id
													bot.sendMessage(admin_Id, message);
													databaseRequest("select userChatID from chatList where workId="+messagesWorkID).then(function(response){
														let userChatID = response[0].userChatID;
														let userPeerID = 2000000000+userChatID;
														bot.execute('messages.send', {
														    random_id: randomInteger(0, 18446744073709551614),
															peer_id:userPeerID,
															chat_id: userChatID,
															message: 'Ждём от вас предоплату в размере '+Price+'₽\n Оплатить можно следующими способами:\n- vk pay\n- вк деньги (скрепка -> деньги)\n- на карту Сбербанк по номеру телефона: +7 (926) 942-27-09 \n\nПосле перевода нажмите на «чек», и отправьте скрин перевода.\n Наши отзывы: https://vk.com/app6326142_-148975156?ref=group_menu',
															group_id:148975156,
															keyboard: Markup.keyboard( [
																[
																	Markup.button({
																      action: {
																        type:"vkpay",
																		hash:"action=pay-to-user&amount="+(Price).toString()+"&user_id=106541016"
																      },
																    })
															    ],
																[ 
															   		Markup.button('Отправить чек','primary')
															    ],
															    [
															    	Markup.button('Вызвать менеджера','primary')
															    ]
															] )
														}).then(function(response){
															console.log(response);
														}).catch(function(err){
															console.log(err);
														})
													})
												})	
											})																		
						  				})
						  			}
						  			if( JSON.parse((value)[7].payload).button == 'Отказаться' ){
						  				let messagesWorkID = (value)[5].split(' ')[0];
						  				databaseRequest("select * from userList where workId="+messagesWorkID).then(function(response){
											if((response[0].Task == 'Диктовка')||(response[0].Task == 'Сдать за вас')||(response[0].Task == 'Передать курьером')){
												var message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork;
											}
											else if((response[0].typeOfWork == 'Лабораторная работа')||(response[0].Task == 'Отработка')||(response[0].Task == 'Нормативы')){
												var message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork;
											}
											else{
												var message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork;
											}
											if((response[0].status == 'waitToPriceResponse')||(response[0].status == 'waitToPriceResponse')){
												databaseRequest("select userChatID from chatList where workId="+messagesWorkID).then(function(response){
													let userChatID = response[0].userChatID;
													let userPeerID = 2000000000+userChatID;
													databaseRequest("delete from chatList where workId ="+messagesWorkID).then(function(){
														databaseRequest("delete from userList where workId ="+messagesWorkID).then(function(){
															bot.execute('messages.send', {
															  random_id: randomInteger(0, 18446744073709551614),
															  chat_id: 8,
															  message: message
															}),
															databaseRequest("select userChatID from chatList where workId="+messagesWorkID).then(function(response){
																let userChatID = response[0].userChatID;
																let userPeerID = 2000000000+userChatID;
																bot.execute('messages.send', {
																    random_id: randomInteger(0, 18446744073709551614),
																	peer_id:userPeerID,
																	chat_id: userChatID,
																	message: 'Ваш заказ был отменен. Вы можете начать заново.',
																	group_id:148975156,
																	keyboard: Markup.keyboard([
																		Markup.button('Вызвать менеджера','primary')
																	])
																}).then(function(response){
																	console.log(response);
																}).catch(function(err){
																	console.log(err);
																})
															})
														})
													})
												})											
											}
										})
						  			}
						  			if( JSON.parse((value)[7].payload).button == 'Отправить чек' ){
						  				let messagesWorkID = (value)[5].split(' ')[0];
						  					databaseRequest("select userChatID from chatList where workId="+messagesWorkID).then(function(response){
												let userChatID = response[0].userChatID;
												let userPeerID = 2000000000+userChatID;
												isExecutor(user_Id).then(function(){
													bot.execute('messages.send', {
													    random_id: randomInteger(0, 18446744073709551614),
														peer_id:userPeerID,
														chat_id: userChatID,
														message: 'Команда не доступна исполнителю',
														group_id:148975156
													}).then(function(response){
														console.log(response);
													}).catch(function(err){
														console.log(err);
													})											
												}).catch(function(){
													databaseRequest("select * from userList where workId="+messagesWorkID).then(function(response){
														if(response[0] != ''){
															databaseRequest("update userList set sendingPaymentCheck=1 where workId="+messagesWorkID).then(function(){
																databaseRequest("select userChatID from chatList where workId="+messagesWorkID).then(function(response){
																	let userChatID = response[0].userChatID;
																	let userPeerID = 2000000000+userChatID;
																	bot.execute('messages.send', {
																	    random_id: randomInteger(0, 18446744073709551614),
																		peer_id:userPeerID,
																		chat_id: userChatID,
																		message: 'Присылай чек',
																		group_id:148975156,
																		keyboard: Markup.keyboard([
																			Markup.button('Вызвать менеджера','primary')
																		])
																	}).then(function(response){
																		console.log(response);
																	}).catch(function(err){
																		console.log(err);
																	})
																})
															}) 
														}
													})		
												})
											})										
						  			}		
						  			if( JSON.parse((value)[7].payload).button == 'Вызвать менеджера' ){
				  						databaseRequest("select chat from userList where workId="+messagesWorkID).then(function(response){
											let messagesChatID = response[0].chat;
											let messagesPeerID = 2000000000+messagesChatID;						
											EASYBOTVK.call('messages.getInviteLink', {
												peer_id: messagesPeerID,
												group_id:148975156,
											}).then(function(chatLink){
												databaseRequest('select workID from chatList where executorChatId='+messagesChatID).then(function(response){
													bot.execute('messages.send', {
													  random_id: randomInteger(0, 18446744073709551614),
													  peer_id: messagesPeerID,
													  chat_id: messagesChatID,
													  message: 'Менеджер оповещен. Скоро он свяжется с вами в этой беседе',
													  keyboard: Markup.keyboard([
													  	[
													  		Markup.button('Вызвать менеджера','primary')
													  	]
													  ])
													}).then(function(response){
														//console.log(response);
													}).catch(function(err){
														console.log(3746,err);
													})
													bot.sendMessage(specIDs,'Заказу с ID: #'+messagesWorkID+' потребовался менеджер.\nСсылка на беседу заказа: '+chatLink.link,null,Markup.keyboard([
														[
															Markup.button('Получить информацию id:'+messagesWorkID, 'primary')
														]
													]).oneTime())
												})
											})													
										})				  						
				  					}
				  					if( JSON.parse((value)[7].payload).button == 'Отменить заказ' ){
				  						databaseRequest("select * from userList where workId="+messagesWorkID).then(function(response){
											if(response[0]!=undefined){
												databaseRequest("update userList set status='Declined' where workId="+messagesWorkID).then(function(){
													databaseRequest("delete from chatList where workId="+messagesWorkID).then(function(){
														databaseRequest("select chat from userList where workId="+messagesWorkID).then(function(response){
															let messagesChatID = response[0].chat;
															let messagesPeerID = 2000000000+messagesChatID;	
															bot.execute('messages.send', {
															  random_id: randomInteger(0, 18446744073709551614),
															  peer_id: messagesPeerID,
															  chat_id: messagesChatID,
															  message: 'Ваш заказ отменен. Пожалуйста, укажите прчиину отмены, чтобы мы могли улучшить качество сервиса.\n Выберите вариант, либо укажите свой.',
															  keyboard: Markup.keyboard([
																[
																	Markup.button('Долгий ответ', 'primary'),
																	Markup.button('Разобрался сам', 'positive')
																],
																[
																	Markup.button('Высокая цена', 'primary'),
																	Markup.button('Вы хамло!', 'negative')
																],
																[
																	Markup.button('Не доверяю', 'negative')
																],
																[
																	Markup.button('Пропустить', 'positive')
																]
															]).oneTime()
															}).then(function(response){
																//console.log(response);
															}).catch(function(err){
																console.log(4504,err);
															})
														})
													})			
												})
											}
											else{
												databaseRequest("select chat from userList where workId="+messagesWorkID).then(function(response){
													let messagesChatID = response[0].chat;
													let messagesPeerID = 2000000000+messagesChatID;	
													bot.execute('messages.send', {
													  random_id: randomInteger(0, 18446744073709551614),
													  peer_id: messagesPeerID,
													  chat_id: messagesChatID,
													  message: 'Произошла ошибка. Администратор скоро решит проблему..'
													}).then(function(response){
														//console.log(response);
													}).catch(function(err){
														console.log(4665,err);
													})
												})
											}
										}).catch(function(err){
											console.log(89,err);
										})					  						
				  					}
				  					if( (JSON.parse((value)[7].payload).button == 'Долгий ответ')||(JSON.parse((value)[7].payload).button == 'Разобрался сам')||(JSON.parse((value)[7].payload).button == 'Высокая цена')||(JSON.parse((value)[7].payload).button == 'Вы хамло!')||(JSON.parse((value)[7].payload).button == 'Не доверяю') ){
				  						databaseRequest("update userList set comment='"+JSON.parse((value)[7].payload).button+"' where workId="+messagesWorkID).then(function(){
				  							databaseRequest("select * from userList where workId="+messagesWorkID).then(function(response){
					  							var message;
												if( (response[0].executor != null)&&(response[0].executor != 0) ){
													let executor = response[0].executor;
													message = 'Клиент отказался \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\nИсполнитель: https://vk.com/id'+executor+'\nСдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Причина: '+response[0].comment;
												}
												else{
													message = 'Клиент отказался \n Цена:'+response[0].price+' \n -----------------\n Клиент: https://vk.com/id'+response[0].id+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork +'\n Задача: '+response[0].Task+'\n Причина: '+response[0].comment;
												}
												let messagesChatID = response[0].chat;
												let messagesPeerID = 2000000000+messagesChatID;	
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  peer_id: messagesPeerID,
												  chat_id: messagesChatID,
												  message: 'Спасибо за отзыв'
												}).then(function(response){}).catch(function(err){})
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 8,
												  message: message
												})
					  						})	
				  						})					  										  						
				  					}
					  			})		  			
					  		}
					  		else if( (value)[5] == 'Цены'){ 						  			
					  			if( JSON.parse((value)[7].payload).button.split("стоимость ")[1] != undefined ){						  				
					  				let workId = JSON.parse((value)[7].payload).button.split("стоимость ")[1];
					  				databaseRequest("update grandadmin set priceto="+workId+" where id="+user_Id).then(function(){
					  					searchByWorkId(workId).then(function(response){
											databaseRequest("update grandadmin set priceto="+workId+" where id="+user_Id).then(function(){
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 4,
												  message: 'Укажите стоимость пример: 1700',
												})
											}).catch(function(err){})
										}).catch(function(err){
											if(err == 'not-found'){
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 4,
												  message: 'Заказа с ID: '+workId +' не найдено.',
												})
											}
											else if(err == "workId doesn't exist"){
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 4,
												  message: 'Не указан ID',
												})
											}
										})
					  				})						  				
					  			}					  			
					  			else if( JSON.parse((value)[7].payload).button.split("Наценка: ")[1].split(' ID')[0] != undefined ){
					  				databaseRequest("select id from executorList where executor_id ="+JSON.parse( (value)[7].payload ).button.split("ID:")[1]).then(function(response){
					  					let executorID = response[0].id;
						  				let ToUser_Id = JSON.parse((value)[7].payload).button.split(" ID")[0].split("Наценка: ")[1];			  				
						  				databaseRequest("update grandadmin set ApproximatePriceFrom="+executorID+",ApproximatePriceTo="+ToUser_Id+" where id="+user_Id).then(function(){
						  					bot.execute('messages.send', {
											  random_id: randomInteger(0, 18446744073709551614),
											  chat_id: 4,
											  message: 'Укажите стоимость',
											})
						  				})
					  				})					  				
					  			}
					  			/*else if( JSON.parse((value)[7].payload).button.split("стоимость ")[1] != undefined ){						  				
					  				let workId = JSON.parse((value)[7].payload).button.split("стоимость ")[1];
					  				databaseRequest("update grandadmin set priceto="+workId+" where id="+user_Id).then(function(){
					  					searchByWorkId(workId).then(function(response){
											databaseRequest("update grandadmin set priceto="+((ctx.message.body).split('стоимость')[1]).split(' ')[1]+" where id="+user_Id).then(function(){
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 4,
												  message: 'Укажите стоимость пример: 1700',
												})
											}).catch(function(err){})
										}).catch(function(err){
											if(err == 'not-found'){
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 4,
												  message: 'Заказа с ID: '+(ctx.message.body).split(':')[1] +' не найдено.',
												})
											}
											else if(err == "workId doesn't exist"){
												bot.execute('messages.send', {
												  random_id: randomInteger(0, 18446744073709551614),
												  chat_id: 4,
												  message: 'Не указан ID',
												})
											}
										})
					  				})						  				
					  			}*/
					  		}		
					  		else if( (value)[5] == 'Экзамены, нормативы и т.д.'){
									let user_Id = (value)[7].from;	
									if( JSON.parse((value)[7].payload).button.split("Сделать личным id:")[1] != undefined ){											
										isAdmin(user_Id).then(function(){
											let workId = JSON.parse((value)[7].payload).button.split("Сделать личным id:")[1];											
											databaseRequest('update userList set status="Personal",executor='+user_Id+' where workId='+workId).then(function(){
												databaseRequest("select chat from userList where workId="+workId).then(function(response){
													if(response[0] != undefined){
														let messagesChatID = response[0].chat;
														let messagesPeerID = 2000000000+messagesChatID;																			
														EASYBOTVK.call('messages.getInviteLink', {
															peer_id: messagesPeerID,
															group_id:148975156,
														}).then(function(chatLink){
															bot.execute('messages.send', {
															  random_id: randomInteger(0, 18446744073709551614),
															  chat_id: 7,
															  message: 'Заказ перенесен в личные\n Cсылка на беседу заказа: '+chatLink.link
															})
														})	
													}
													else{
														bot.execute('messages.send', {
														  random_id: randomInteger(0, 18446744073709551614),
														  chat_id: 7,
														  message: 'Нет заказа с id: '+workId
														})
													}														
												})
											});											
										})
									}									
					  		}			  		
				  		}					  		
				  		else if( ( (value)[7].attach1_type == 'money_transfer')&&( specIDs.includes( parseInt( (value)[3] ),0) ) ){
					  		let user_Id = (value)[3];
				  			let gotAmount = (value)[7].attach1_amount;
					  		databaseRequest("select price,workId from userList where id="+user_Id+" and orderFinished=1 and paid is null").then(function(response){
					  			if(response[0]!= undefined){
					  				let priceForWork = response[0].price;
					  				let workId = response[0].workId;
					  				if( parseInt(priceForWork) <= parseInt(gotAmount) ){
					  					databaseRequest("select userChatId,executorChatId from chatList where workId="+workId).then(function(response){
					  						let userChatID = response[0].userChatId;
											let userPeerID = 2000000000+userChatID;

											let executorChatId = response[0].executorChatId;
											let executorPeerID = 2000000000+executorChatId;
											databaseRequest("update userList set paid =1 where workId="+workId).then(function(){
												bot.execute('messages.send', {
												    random_id: randomInteger(0, 18446744073709551614),
													peer_id: userPeerID,
													chat_id: userChatID,
													message: 'Получена оплата заказа с ID: '+workId+'\n Решения будут поступать в эту беседу. Ни в коев случае не выходите из беседы, иначе заказ закроется.\n\n Если у вас возникнут недопонимания со специалистом, выполните команду "Позвать менеджера", и он ответит Вам в беседе. ',
													group_id:148975156														
												}).then(function(response){
													console.log(response);
												}).catch(function(err){
													console.log(err);
												})
												bot.sendMessage([106541016,20904658],'Получена оплата заказа с ID: '+workId)
												bot.execute('messages.send', {
												    random_id: randomInteger(0, 18446744073709551614),
													peer_id: executorPeerID,
													chat_id: executorChatId,
													message: 'Получена оплата заказа с ID: '+workId+'. Удачной работы.',
													group_id:148975156,
													keyboard: Markup.keyboard([
													  	[
													  		Markup.button('Получить информацию о заказе','primary')
													  	],
													  	[
													  		Markup.button('Указать стоимость','primary')
													  	],
													  	[
													  		Markup.button('Завершить заказ','positive')
													  	],
													  	[
													  		Markup.button('Вызвать менеджера','primary')
													  	]
													])
												}).then(function(response){
													console.log(response);
												}).catch(function(err){
													console.log(err);
												})
											})											
										})
					  				}
					  				else{
					  					bot.sendMessage(user_Id,'Некорректная сумма перевода')
					  				}					  				
					  			}
					  			else{
					  				bot.sendMessage(user_Id,'Заказа не найдено. Уведомите об этом администрацию.')
					  			}
					  		})					  		
				  		}	
				  		else if((value)[5].split(' ')[1] != undefined ){
			  				if( ( (value)[7].from >0 )&& (!specIDs.includes( user_Id,0)) ){
			  					console.log('Не спец');
			  					let messageFrom = (value)[7].from;
					  			let messagesWorkID = (value)[5].split(' ')[0];
					  			if( Number.isInteger(parseInt(messagesWorkID)) ){
						  			databaseRequest("select * from chatList where workId="+messagesWorkID).then(function(response){		
						  				let orderDetails = response;	
						  				if( orderDetails != '' ){ 
											isExecutor(messageFrom).then(function(){ 
												selectUser(messageFrom).then(function(response){
													var setPrice = response[0].setpriceto;
													if((setPrice != null)&&(setPrice != 0)){
														searchByWorkId(messagesWorkID).then(function(response){					
															if( Number.isInteger(parseInt((value)[6])) ){
																var workID = response[0].workId;
																let executorStartPrice = response[0].executorStartPrice;
																let priceMarkup = response[0].priceMarkup;
																var price = (value)[6];
																var message = '\n -----------------\n ID заказа: '+workID+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+'\nВид помощи:'+response[0].Task+'\nДедлайн:'+response[0].deadline+'\nВремя начала работы:'+response[0].workTime+'\nКомментарий:'+response[0].comment+'\n Вложения: \n';
																var Photos = ''; var Docs = '';
																if(response[0].photos!= undefined){
																	for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
																		Photos += (response[0].photos).split('<--->')[i]+'\n';
																	}
																}
																if(response[0].docs!= undefined){
																	for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
																		Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
																	}
																}
																databaseRequest("update executorList set setpriceto =0 where id="+messageFrom).then(function(){
																	databaseRequest("update userList set executorPrice="+parseInt(price)+",status = 'PriceSelected' where workId ="+workID).then(function(){
																		databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
																			let executorChatId = response[0].executorChatId;
																			let executorPeerId = 2000000000+executorChatId;

																			for(let i =0; i < executorStartPrice.split(',').length;i++){
																				if( (executorStartPrice.split(',')[i]).split('_')[1] == messageFrom ){
																					executorStartPrice = (executorStartPrice.split(',')[i]).split('_')[0];
																					break;
																				}
																			}
																			for(let i =0; i < priceMarkup.split(',').length;i++){
																				if( (priceMarkup.split(',')[i]).split('_')[1] == priceMarkup.split('_')[1] ){
																					priceMarkup = (priceMarkup.split(',')[i]).split('_')[0];
																					break;
																				}
																			}
																			bot.execute('messages.send', {
																			  random_id: randomInteger(0, 18446744073709551614),
																			  chat_id: 4,
																			  message: 'Исполнитель найден: https://vk.com/id'+messageFrom+'\n Примерная цена:'+executorStartPrice+'\nПримерная цена с наценкой:'+priceMarkup+'\nНовая цена: '+price+'\n Укажите новую стоимость\nИнформация о заказе: \n'+message+Photos,
																			  keyboard: Markup.keyboard([
																			  	[
																			  		Markup.button('стоимость '+messagesWorkID, 'primary')
																			  	]
																			  ]).inline()
																			}).then(function(){}).catch(function(){});

																			bot.execute('messages.send', {
																			    random_id: randomInteger(0, 18446744073709551614),
																				peer_id: executorPeerId,
																				chat_id: executorChatId,
																				message: 'Информация отправлена',
																				group_id:148975156,
																				keyboard: Markup.keyboard([
																					[
																				  		Markup.button('Отменить заказ','negative')
																				  	],
																				  	[
																				  		Markup.button('Вызвать менеджера','negative')
																				  	]
																				])
																			}).then(function(){}).catch(function(){});
																		})
																	})
																})
															}
															else{
																databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
																	let executorChatId = response[0].executorChatId;
																	let executorPeerId = 2000000000+executorChatId;
																	bot.execute('messages.send', {
																	    random_id: randomInteger(0, 18446744073709551614),
																		peer_id: executorPeerId,
																		chat_id: executorChatId,
																		message: 'Ошибка команды. Укажите стоимость целым числом',
																		group_id:148975156,
																	}).then(function(){}).catch(function(){});
																})
															}
														}).catch(function(err){
															console.log(err);
															databaseRequest("select executorChatId from chatList where workId="+messagesWorkID).then(function(response){
																let executorChatId = response[0].executorChatId;
																let executorPeerId = 2000000000+executorChatId;
																bot.execute('messages.send', {
																    random_id: randomInteger(0, 18446744073709551614),
																	peer_id: executorPeerId,
																	chat_id: executorChatId,
																	message: 'Заказа с ID: '+messagesWorkID +' не найдено.',
																	group_id:148975156,
																})
															})
														})
													}
													else{
														let chatID = orderDetails[0].userChatId
														let peerID = 2000000000+chatID;
														let message = '&#10084; '+(value)[6];
														if( user_Id == orderDetails[0].executorId ){
															databaseRequest("select resendExecutor from chatList where workId="+messagesWorkID).then(function(response){
																if(response[0].resendExecutor == true){
																	databaseRequest('select paymentCheck from userList where workId='+messagesWorkID).then(function(check){
																		let buttons = [];
																		console.log(messagesWorkID,check[0].paymentCheck);
																		if( (check[0].paymentCheck == null)||(check[0].paymentCheck == 0) ){
																			buttons = [
																				[Markup.button('Отменить заказ','negative')],
																				[Markup.button('Вызвать менеджера','primary')]
																			]																		
																		}
																		else{
																			buttons = [
																				[Markup.button('Отменить заказ','negative')],
																				[Markup.button('Вызвать менеджера','primary')]
																			]	
																		}
																		if( (value)[7].attach1_type!= undefined ){
																		let userPeerID = (value)[3];
																		EASYVK.call('messages.getHistory', {
																			count:1,
																			peer_id: userPeerID
																		}).then(function(attach){
																			message = '&#10084; '+attach.items[0].text;
																			var photos = ''; var docs = '';
																			for(var i =0;i < attach.items[0].attachments.length;i++){
																				if( attach.items[0].attachments[i].photo!= undefined) photos += attach.items[0].attachments[i].photo.sizes[attach.items[0].attachments[i].photo.sizes.length-1].url+'\n';
																				if( attach.items[0].attachments[i].doc!= undefined) docs += (attach.items[0].attachments[i].doc).url+'\n';
																			}
																			replaceAll(message).then(function(response){
																				bot.execute('messages.send', {
																					random_id: randomInteger(0, 18446744073709551614),
																					peer_id: peerID,
																					chat_id: chatID,
																					message: response+'\n\n\n Вложения:\n'+photos+'\n'+docs,
																					group_id:148975156,
																					keyboard: Markup.keyboard(
																						buttons
																					)
																				})	
																			})
																		})																	
																	}
																	else{
																		bot.execute('messages.send', {
																			random_id: randomInteger(0, 18446744073709551614),
																			peer_id: peerID,
																			chat_id: chatID,
																			message: message,
																			group_id:148975156,
																			keyboard: Markup.keyboard(
																				buttons
																			)
																		})
																	}
																	})																		
																}
															})
														}
														else{
															let messagesID = parseInt(((value)[5]).split('id:')[1]);
			            									let messagesPeerID = messagesID +2000000000;														
															let sendMessage = EASYBOTVK.call('messages.send', {
																random_id: randomInteger(0, 18446744073709551614),
																peer_id: messagesPeerID,
																chat_id: messagesID,
																message: 'У данного заказа уже имеется исполнитель. Далее эта беседа бесполезна, вы можете её покинуть.'
															})
														}
													}
												})
											}).catch(function(){
												selectUser(messageFrom,1,messagesWorkID).then(function(check){
													if(check[0].sendingPaymentCheck == 1){
														console.log('Чек: '+messagesWorkID);
														if( (value)[7].attach1_type!= undefined ){
															let userPeerID = (value)[3];
															EASYVK.call('messages.getHistory', {
																count:1,
																peer_id: userPeerID
															}).then(function(attach){																												
																var paymentCheck = '';
																for(var i =0;i < attach.items[0].attachments.length;i++){
																	if( attach.items[0].attachments[i].photo!= undefined) paymentCheck += attach.items[0].attachments[i].photo.sizes[attach.items[0].attachments[i].photo.sizes.length-1].url+'\n';
																	if( attach.items[0].attachments[i].doc!= undefined) paymentCheck += (attach.items[0].attachments[i].doc).url+'\n';
																}
																databaseRequest("update userList set paymentCheck='"+paymentCheck+"',sendingPaymentCheck=0 where workId ="+messagesWorkID+" and sendingPaymentCheck=1").then(function(){
																	databaseRequest("select userChatID,executorChatId from chatList where workId="+messagesWorkID).then(function(response){
																		let userChatID = response[0].userChatID;
																		let userPeerID = 2000000000+userChatID;	

																		let executorChatId = response[0].executorChatId;
																		let executorPeerID = 2000000000+executorChatId;	

																		var message = 'Получен чек\n -----------------\n Клиент: https://vk.com/id'+check[0].id+'\nID заказа: '+messagesWorkID+'\nСдаваемый предмет: '+check[0].subject+'\n Тип работы: '+check[0].typeOfWork +'\n Задача: '+check[0].Task+'\n Комментарий: '+check[0].comment+'\nИсполнитель: https://vk.bom/id'+check[0].executor+'\nЦена исполнителя:'+check[0].executorPrice+'\nЦена заказа: '+check[0].price+' \n\nВложения: ';
																		var Photos = ''; var Docs = '';
																		if(check[0].photos!= undefined){
																			for(var i = 0; i < (check[0].photos).split('<--->').length;i++){
																				Photos += (check[0].photos).split('<--->')[i]+'\n';
																			}
																		}
																		if(check[0].docs!= undefined){
																			for(var i = 0; i < (check[0].docs).split('<--->').length;i++){
																				Docs += ' \n'+(check[0].docs).split('<--->')[i]+'\n';
																			}
																		}

																		EASYBOTVK.call('messages.getInviteLink', {
																			peer_id: userPeerID,
																			group_id:148975156,
																		}).then(function(chatLink){
																			message += '\n\n\n------------\nСсылка на беседу:\n'+chatLink.link;
																			if( (executorChatId != null)&&(executorChatId != 0) ){
																				EASYBOTVK.call('messages.getInviteLink', {
																					peer_id: executorPeerID,
																					group_id:148975156,
																				}).then(function(ExecutorchatLink){
																					message += '\n\n\n------------\nСсылка на беседу исполнителя:\n'+ExecutorchatLink.link;	
																					bot.execute('messages.send', {
																					  random_id: randomInteger(0, 18446744073709551614),
																					  chat_id: 8,
																					  message: message+'\n\n'+Photos+'\n'+Docs+'\n-----------------\nЧек:\n'+paymentCheck,																						  
																					})	
																					bot.sendMessage([106541016,20904658],'Получена оплата заказа с ID: '+workId)	
																				})
																			}
																			else{
																				bot.execute('messages.send', {
																				  random_id: randomInteger(0, 18446744073709551614),
																				  chat_id: 8,
																				  message: message+'\n\n'+Photos+'\n'+Docs+'\n-----------------\nЧек:\n'+paymentCheck
																				})	
																			}
																			
																		
																			
																		}).catch(function(err){
																			console.log(err);
																		})																			
																			
																		if( (executorChatId != null)&&(executorChatId != 0) ){
																			bot.execute('messages.send', {
																				random_id: randomInteger(0, 18446744073709551614),
																				peer_id:executorPeerID,
																				chat_id: executorChatId,
																				message: 'Получена оплата. Можете приступать к выполнению работы.',
																			 	keyboard: Markup.keyboard([
																				  	[
																				  		Markup.button('Получить информацию о заказе','primary')
																				  	],
																				  	[
																				  		Markup.button('Указать стоимость','primary')
																				  	],
																				  	[
																				  		Markup.button('Завершить заказ','positive')
																				  	],
																				  	[
																				  		Markup.button('Вызвать менеджера','primary')
																				  	]
																				])
																			}).then(function(response){
																				//console.log(response);
																			}).catch(function(err){
																				console.log(3746,err);
																			})
																		}														
																		bot.execute('messages.send', {
																		    random_id: randomInteger(0, 18446744073709551614),
																			peer_id:userPeerID,
																			chat_id: userChatID,
																			message: 'Чек получен. Специалист начнёт выполнять работу исходя из ваших договоренностей',
																			group_id:148975156,
																			keyboard: Markup.keyboard([
																				[Markup.button('Вызвать менеджера','primary')],
																				[Markup.button('Отменить заказ','negative')]
																			])
																		}).then(function(response){
																			console.log(response);
																		}).catch(function(err){
																			console.log(err);
																		})
																	})
																})
															})	
														}
													}																						
													else if( (orderDetails[0].executorChatId != null)&&(orderDetails[0].executorChatId !=0) ){
														let chatID = orderDetails[0].executorChatId;
														let peerID = 2000000000+chatID;
														let message = '&#128396; '+(value)[6];
														databaseRequest("select resendUser from chatList where workId="+messagesWorkID).then(function(response){
															if(response[0].resendUser == true){
																if( (value)[7].attach1_type!= undefined ){
																	let userPeerID = (value)[3];
																	let attach = EASYVK.call('messages.getHistory', {
																		count:1,
																		peer_id: userPeerID
																	}).then(function(attach){
																		message = '\n'+attach.items[0].text;
																		var photos = ''; var docs = '';
																		for(var i =0;i < attach.items[0].attachments.length;i++){
																			if( attach.items[0].attachments[i].photo!= undefined) photos += attach.items[0].attachments[i].photo.sizes[attach.items[0].attachments[i].photo.sizes.length-1].url+'\n';
																			if( attach.items[0].attachments[i].doc!= undefined) docs += (attach.items[0].attachments[i].doc).url+'\n';
																		}
																		replaceAll(message).then(function(response){
																			bot.execute('messages.send', {
																			  random_id: randomInteger(0, 18446744073709551614),
																			  peer_id: peerID,
																			  chat_id: chatID,
																			  group_id:148975156,
																			  message: response+'\n\n\n Вложения:\n'+photos+'\n'+docs,
																			  keyboard: Markup.keyboard([
																				  	[
																				  		Markup.button('Получить информацию о заказе','primary')
																				  	],
																				  	[
																				  		Markup.button('Указать стоимость','primary')
																				  	],
																				  	[
																				  		Markup.button('Завершить заказ','positive')
																				  	],
																				  	[
																				  		Markup.button('Вызвать менеджера','primary')
																				  	]
																				])
																			}).then(function(response){
																				//console.log(response);
																			}).catch(function(err){
																				console.log(3746,err);
																			})
																			console.log('////User send image////');
																		})																			
																	})	
																}															
																else{
																	replaceAll(message).then(function(response){
																		bot.execute('messages.send', {
																			random_id: randomInteger(0, 18446744073709551614),
																			peer_id: peerID,
																			chat_id: chatID,
																			message: response,
																			group_id:148975156,
																			keyboard: Markup.keyboard([
																			  	[
																			  		Markup.button('Получить информацию о заказе','primary')
																			  	],
																			  	[
																			  		Markup.button('Указать стоимость','primary')
																			  	],
																			  	[
																			  		Markup.button('Завершить заказ','positive')
																			  	],
																			  	[
																			  		Markup.button('Вызвать менеджера','primary')
																			  	]
																			])
																		}).then(function(){}).catch(function(){})	
																	})																										
																}	
															}
														})
													}	
													else if( (check[0].status == 'Personal')&&(specIDs.includes(check[0].executor,0)) ){

													}
													else{
														let chatID = orderDetails[0].userChatId
														let peerID = 2000000000+chatID;
														let message = 'Вы тут один. Подождите, когда кто-нибудь из специалистов возьмётся за ваш заказ';
														bot.execute('messages.send', {
														    random_id: randomInteger(0, 18446744073709551614),
															peer_id: peerID,
															chat_id: chatID,
															message: message,
															group_id:148975156,
															keyboard: Markup.keyboard([
																[
															  		Markup.button('Отменить заказ','negative')
															  	],
															  	[
															  		Markup.button('Вызвать менеджера','negative')
															  	]
															])
														}).then(function(){}).catch(function(){})
													}
												}).catch(function(err){
													console.log(5325,err);
												})								
											})
										}	
										else{
											let chatID = parseInt((value)[5].split('id:')[1]);	 
											let peerID = 2000000000+chatID;
											bot.execute('messages.send', {
											    random_id: randomInteger(0, 18446744073709551614),
												peer_id: peerID,
												chat_id: chatID,
												message: 'Ваш заказ отменен. Более эта беседа бесполезна.',
												group_id:148975156,
												keyboard: Markup.keyboard([
													[
												  		Markup.button('Отменить заказ','negative')
												  	],
												  	[
												  		Markup.button('Вызвать менеджера','negative')
												  	]
												])
											}).then(function(response){
											}).catch(function(err){
											})
										}			  				
						  			}).catch(function(){
						  				databaseRequest("select * from chatList where workId="+messagesWorkID).then(function(response){
							  				let chatID = orderDetails[0].userChatId
											let peerID = 2000000000+chatID;
											bot.execute('messages.send', {
											    random_id: randomInteger(0, 18446744073709551614),
												peer_id: peerID,
												chat_id: chatID,
												message: 'Ваш заказ отменен. Более эта беседа бесполезна.',
												group_id:148975156,
												keyboard: Markup.keyboard([
													[
												  		Markup.button('Отменить заказ','negative')
												  	],
												  	[
												  		Markup.button('Вызвать менеджера','negative')
												  	]
												])
											}).then(function(response){
											}).catch(function(err){
											})
										})
						  			})
								}
			  				}
			  				else if(specIDs.includes( user_Id,0)){
			  					if( (value)[6] == '!запретить' ){
			  						let messagesWorkID = (value)[5].split(' ')[0];
				  					let chatID = (value)[5].split('id:')[1];
				  					let peerID = 2000000000+parseInt(chatID);
				  					databaseRequest("select userChatId,executorChatId from chatList where workId="+messagesWorkID).then(function(response){
				  						if(response[0].userChatId == chatID){
				  							databaseRequest("update chatList set resendUser=false where workId="+messagesWorkID).then(function(){
				  								bot.execute('messages.send', {
												    random_id: randomInteger(0, 18446744073709551614),
													peer_id: peerID,
													chat_id: chatID,
													message: 'Сообщения из данной беседы более не  будут пересылаться исполнителю',
													group_id:148975156,
												}).then(function(){}).catch(function(){});
				  							})
				  						}
				  						if(response[0].executorChatId == chatID){
				  							databaseRequest("update chatList set resendExecutor=false where workId="+messagesWorkID).then(function(){
				  								bot.execute('messages.send', {
												    random_id: randomInteger(0, 18446744073709551614),
													peer_id: peerID,
													chat_id: chatID,
													message: 'Сообщения из данной беседы более не  будут пересылаться заказчику',
													group_id:148975156,
												}).then(function(){}).catch(function(){});
				  							})
				  						}
				  					})
			  					}	
			  					if( (value)[6] == '!разрешить' ){ 
			  						let messagesWorkID = (value)[5].split(' ')[0];
				  					let chatID = (value)[5].split('id:')[1];
				  					let peerID = 2000000000+parseInt(chatID);
				  					databaseRequest("select userChatId,executorChatId from chatList where workId="+messagesWorkID).then(function(response){
				  						if(response != ''){
				  							if( (response[0].userChatId != null)&&(response[0].userChatId != 0)&&(response[0].userChatId == parseInt(chatID) ) ){
				  								databaseRequest("update chatList set resendUser=true where workId="+messagesWorkID).then(function(){
					  								bot.execute('messages.send', {
													    random_id: randomInteger(0, 18446744073709551614),
														peer_id: peerID,
														chat_id: chatID,
														message: 'Сообщения из данной беседы будут пересылаться исполнителю',
														group_id:148975156,
													}).then(function(){}).catch(function(err){ console.log(err); });
					  							})
					  						}
					  						if( ( (response[0].executorChatId != null)&&(response[0].executorChatId != 0) )&&(response[0].executorChatId == parseInt(chatID)) ){
					  							databaseRequest("update chatList set resendExecutor=true where workId="+messagesWorkID).then(function(){
					  								bot.execute('messages.send', {
													    random_id: randomInteger(0, 18446744073709551614),
														peer_id: peerID,
														chat_id: chatID,
														message: 'Сообщения из данной беседы будут пересылаться заказчику',
														group_id:148975156,
													}).then(function(){}).catch(function(){});
					  							})
					  						}
				  						}					  						
				  					})
			  					}				  					
			  				}		  			
				  		}	  		
				  		else if( ( value != undefined )&&((value)[5] == 'Цены')){
				  			databaseRequest('select * from grandadmin where id='+user_Id).then(function(response){
				  				if( (response[0].ApproximatePriceFrom != null)&&(response[0].ApproximatePriceFrom != 0)&&(response[0].ApproximatePriceTo != null)&&(response[0].ApproximatePriceTo != 0) ){
				  					let executorSelfID = response[0].ApproximatePriceFrom;
				  					let user_WorkId = response[0].ApproximatePriceTo;
				  					databaseRequest("select executor_id from executorList where id="+executorSelfID).then(function(response){
				  						let excutorID = response[0].executor_id;
						  				databaseRequest("select * from userList where workId="+user_WorkId).then(function(response){
						  					if( ((value)[7]).from >0 ){
							  					if( Number.isInteger(parseInt((value)[6])) ){
													var workID = response[0].workId;
													let chatID = response[0].chat;
													let peerID = 2000000000+chatID;
													var price = parseInt((value)[6]);
													let priceMarkup ='';
													if((response[0].priceMarkup != null)&&(response[0].priceMarkup != 0)) priceMarkup = response[0].priceMarkup+','+price+'_'+executorSelfID;
													else priceMarkup = price+'_'+executorSelfID;
													var message = '\n -----------------\n ID заказа: '+workID+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+' \n Вложения: \n';
													var Photos = ''; var Docs = '';
													if(response[0].photos!= undefined){
														for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
															Photos += (response[0].photos).split('<--->')[i]+'\n';
														}
													}
													if(response[0].docs!= undefined){
														for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
															Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
														}
													}
													databaseRequest("update grandadmin set ApproximatePriceFrom=0,ApproximatePriceTo=0 where id="+user_Id).then(function(){
														databaseRequest("update userList set priceMarkup='"+priceMarkup+"' where workId="+workID).then(function(){
															databaseRequest("select commentFromExecutorWhenOrderIsAccepted from userList where workId="+workID).then(function(response){
																if( (response[0].commentFromExecutorWhenOrderIsAccepted!=null)&&((response[0].commentFromExecutorWhenOrderIsAccepted!=0)) ){
																	let chatMessage = '';
																	for(let i =0; i < response[0].commentFromExecutorWhenOrderIsAccepted.split(',').length;i++){
																		if( response[0].commentFromExecutorWhenOrderIsAccepted.split(',')[i].split('_')[1] ==  executorSelfID) chatMessage = response[0].commentFromExecutorWhenOrderIsAccepted.split(',')[i].split('_')[0];
																	}	
																	if(chatMessage == '') chatMessage = 'Не указан';																	
																	databaseRequest("update executorList set chatMessage='0' where id="+executorSelfID).then(function(){
																		bot.execute('messages.send', {
																		  random_id: randomInteger(0, 18446744073709551614),
																		  chat_id: chatID,
																		  peer_id:peerID,
																		  message: 'Специалист подобран\nID заказа:'+user_WorkId+'\nПримерная цена: '+price+'\nКомментарий исполнителя:'+chatMessage+'\n Информация о заказе: \n'+message+Photos,
																		  keyboard: Markup.keyboard( [Markup.button('Выбрать: '+excutorID, 'positive')] ).inline()
																		})
																	}).catch(function(err){
																		console.log(err);
																	})									
																}	
																else{
																	bot.execute('messages.send', {
																	  random_id: randomInteger(0, 18446744073709551614),
																	  chat_id: chatID,
																	  peer_id:peerID,
																	  message: 'Специалист подобран: ID:'+user_WorkId+'\nПримерная цена: '+price+'\nИнформация о заказе: \n'+message+Photos,
																	  keyboard: Markup.keyboard( [Markup.button('Выбрать: '+excutorID, 'positive')] ).inline()
																	}).then(function(response){console.log(response);}).catch(function(err){console.log(err);})											
																}		
																bot.execute('messages.send', {
																  random_id: randomInteger(0, 18446744073709551614),
																  chat_id: 4,
																  message: 'Информация отправлена',
																}).then(function(){}).catch(function(){})									
															})	
														})								  					
									  				})																				
												}
												else{
													bot.execute('messages.send', {
													  random_id: randomInteger(0, 18446744073709551614),
													  chat_id: 4,
													  message: 'Ошибка команды. Укажите стоимость числом',
													})
												}
											}
						  				})
				  					})					  				
					  			}
					  			else if(response[0].priceto != null){
					  				let workId = response[0].priceto;
					  				databaseRequest("update grandadmin set priceto =0 where id="+user_Id).then(function(){
										searchByWorkId(workId).then(function(response){
											let chatID = response[0].chat;
											let peerID = 2000000000+chatID;						
											var price = ctx.message.body;
											let executorProfileID = response[0].executor;
											var message = '\n -----------------\n ID заказа: '+response[0].workId+'\n Сдаваемый предмет: '+response[0].subject+'\n Тип работы: '+response[0].typeOfWork+' \n Вложения: \n';
											var Photos = ''; var Docs = '';
											if(response[0].photos!= null){
												for(var i = 0; i < (response[0].photos).split('<--->').length;i++){
													Photos += (response[0].photos).split('<--->')[i]+'\n';
												}
											}
											if(response[0].docs!= null){
												for(var i = 0; i < (response[0].docs).split('<--->').length;i++){
													Docs += ' \n'+(response[0].docs).split('<--->')[i]+'\n';
												}
											}
											databaseRequest("select executor_id from executorList where id="+executorProfileID).then(function(response){
													if( (response[0].executor_id != null)&&(response[0].executor_id != 0) ){
														databaseRequest("update userList set price="+price+" where workId="+workId).then(function(){
															bot.execute('messages.send', {
															  random_id: randomInteger(0, 18446744073709551614),
															  peer_id:peerID,
															  chat_id: chatID,
															  message: 'Специалист подобран:\nID исполнителя:'+response[0].executor_id+'\n Стоимость:'+price+'\nИнформация о заказе: \n'+message+Photos+'\n'+Docs,
															  keyboard: Markup.keyboard([
															  	[
															  		Markup.button('Согласиться', 'positive'),
															  		Markup.button('Отказаться', 'negative')
															  	]							   	
															   ])
															}).then(function(response){
																console.log(response);
															}).catch(function(err){
																console.log(err);
															})
															BotReply(ctx,'Информация отправлена заказчику')
														})										
													}
													else{
														BotReply(ctx,'У заказа нет исполнителя')
													}							
												})																					
										}).catch(function(err){
											if(err == 'not-found'){
												BotReply(ctx,'Заказа с ID: '+(ctx.message.body).split(':')[0] +' не найдено.')
											}
											else if(err == "workId doesn't exist"){
												BotReply(ctx,'Не указан ID')
											}
											else{
												console.log(3531,err);
											}
										})
									})	
					  			}
				  			})
		  				}	
				  	}	
				  }
	        }		
	    }    	
	}
}
bot.startPolling( console.log('startPolling'),
	easyvk({
	  token:token,
	  captchaHandler: captchaHandler,
	}).then(async botvk => {
		EASYBOTVK = botvk;				
		easyvk({
		  username:'',
		  password :'',
		  captchaHandler: captchaHandler,
		  reauth: true
		}).then(async manager => { 
			EASYMANAGERVK = manager;
			easyvk({
			  username:'',
			  password :'',
			  captchaHandler: captchaHandler,
			  reauth: true,
			  mode: 'highload', // Самая простая настройка
			  mode: {
				name: 'highload',

				// Каждые 15 МС вся очередь гарантированно будет выполняться (точнее читайте ниже)
				timeout: 150
			  }
			}).then(async vk => {
				EASYVK = vk;
				EASYVK.call('messages.getLongPollServer').then(function(longPollData){
					let key = longPollData.key;
					let ts = longPollData.ts;
					isAuthorized = true;
					console.log('authorized');	
					function getUpdates(){
						return new Promise(function (resolve,reject) {
							setTimeout(function(){
								request('https://im.vk.com/nim513757464?act=a_check&key='+key+'&wait=25&mode=2&ts='+ts, function (error, response, body) {
									if (error){
										console.log(6029,error);
										reject(false);
									}
									else{
										vk.call('messages.getLongPollServer').then(function(longPollData){
											key = longPollData.key;
											ts = longPollData.ts;
											if( (JSON.parse(body).updates != undefined)&&(JSON.parse(body).updates[0]!= undefined)){ 			
											 	let updatesOrderDetails = JSON.parse(body).updates;									 		
											 	for (var updateskey in updatesOrderDetails) {	 		
											        if (typeof updatesOrderDetails[updateskey] === 'object') {
											        	let value = updatesOrderDetails[updateskey];			        	
											        	if( ( value != undefined )&&( (value)[7] != undefined )&&((value)[7].from > 0) ){
											        		resolve(body);
											        	}
											        }
												}
												reject(false);
											}
											else reject(false);
										})
									}																									
								})
							},300)							
						})
					}
					function eventTrigger(){	
						getUpdates().then(function(response){	
							pollRequest(response);
							console.log('Выполнено');
							eventTrigger();	
						}).catch(function(err){
							eventTrigger();
						});	
					}
					eventTrigger();																	
				});				
			}).catch(function(err){
				console.log(5642,err);
			})			
		})		
	}).catch(function(err){
		console.log(5645,err);
	})	
	/*bot.execute('groups.getLongPollServer', {
	  group_id:148975156
	}).then(function(response){
		longPollData = response;
		function makeRequest(ts){
			console.log('request',ts);
			setTimeout(
			function(){
				request(longPollData.server+'?act=a_check&key='+longPollData.key+'&wait=25&ts='+ts, function (error, response, body) {
				  console.error('error:', error); // Print the error if one occurred
				  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				  console.log(updatesOrderDetails); // Print the HTML for the Google homepage.
				  makeRequest(JSON.parse(body).ts);
				})
			},1000)
		}
		makeRequest(longPollData.ts);
	}).catch(function(err){
		console.log(err);
	})*/
);
app.get('/init', function(req, res) {
	databaseRequest("SET SESSION wait_timeout = 604800").then(function(){
		databaseRequest("create table if not exists userList (id int,subject text,status text,typeOfWork text,Task text, photos text,docs text,paymentCheck text,deadline text,workTime text,chat int, executor int, workId int, price float,executorPrice float,executorStartPrice text,priceMarkup text, comment text,orderFinished int,sendingPaymentCheck int,paid int,userInChat int,whoIsAccepted text,whoIsDeclined text,commentFromExecutorWhenOrderIsAccepted text)").then(function(){
			//databaseRequest("create table if not exists historyList (id int,subject text,status text,typeOfWork text,Task text, photos text,docs text,deadline text,chat int, executor int, workId int, price float,executorPrice int, comment text,orderFinished int)").then(function(){
				databaseRequest("create table if not exists executorList (id int,executor_id int,chat int, subject text, setpriceto int, waitto int,chatMessage text)").then(function(){
					databaseRequest("create table if not exists chatList (workId int,id int,executorId int,userChatId int, executorChatId int, resendUser bool default true,resendExecutor bool default true)").then(function(){
						databaseRequest("SHOW TABLES LIKE 'grandadmin'").then(function(response){
							if(response != ''){	
								for(let i =0; i < response.length;i++) specIDs.push(response[i].id);
							}							
							bot.execute('messages.send', {
							  random_id: randomInteger(0, 18446744073709551614),
							  chat_id: 7,
							  message: "Бот работает, авторизация: "+isAuthorized,
							}).then(function(){
								res.send("База создана, подключение установлено."+' '+bot);	
							}).catch(function(){
								res.send("База создана, подключение установлено."+' '+bot);	
							})
						})
					})							
				})
			//})											
		})
	})
});
app.get('/sendTest', function(req, res) {
	let dateNow = new Date();
	let message = "Тест "+dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear()+'-'+dateNow.getHours()+'-'+dateNow.getMinutes();	
	bot.sendMessage(331658531, message);
	res.send(message);
});
app.get('/', function(req, res) {
	let message = "В сети, авторизация: "+isAuthorized;
	res.send(message);		  
});

app.listen(3000);

module.exports.app = app;
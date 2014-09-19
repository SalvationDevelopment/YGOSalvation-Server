/* jshint node : true */
 var queryfor = {
  statistics :  "SELECT `datas`.`id` AS id, `datas`.`alias` as alias, `texts`.`name` as name FROM `datas`, `texts` WHERE `datas`.`id` = `texts`.`id` AND `datas`.`type` <> 16401 AND `datas`.`alias` = 0"
};
module.exports = queryfor;
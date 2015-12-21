--Moon-Light Lio Dancer
function c13790825.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcCodeFun(c,13790880,aux.FilterBoolFunction(Card.IsSetCard,0x209),2,true,true)

end

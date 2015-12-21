--輝竜星－ショウフク
function c80100051.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(Card.IsSetCard,0x9c),1)
	c:EnableReviveLimit()
	--to deck
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80100051,0))
	e1:SetCategory(CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c80100051.con)
	e1:SetTarget(c80100051.tg)
	e1:SetOperation(c80100051.op)
	c:RegisterEffect(e1)
	--Destroy&Summ
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100051,0))
	e2:SetCategory(CATEGORY_DESTROY+CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80100051.destg)
	e2:SetOperation(c80100051.desop)
	c:RegisterEffect(e2)
end
function c80100051.con(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_SYNCHRO
end
function c80100051.attributecast(c)
	return bit.band(c:GetOriginalAttribute(),0x7f)
end
function c80100051.tg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsAbleToDeck() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsAbleToDeck,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,nil) end
	local mc=e:GetHandler():GetMaterial():GetClassCount(c80100051.attributecast)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,Card.IsAbleToDeck,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,mc,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,g:GetCount(),0,0)
end
function c80100051.op(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=g:Filter(Card.IsRelateToEffect,nil,e)
	Duel.Duel.SendtoDeck(sg,nil,2,REASON_EFFECT)
end
function c80100051.spfilter(c,e,tp)
	return c:IsLevelBelow(4) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100051.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	
	if chk==0 then 
		if Duel.GetLocationCount(tp,LOCATION_MZONE)>0 then 
			e:SetLabel(0)
			return 	Duel.IsExistingTarget(Card.IsDestructable,tp,LOCATION_ONFIELD,0,1,nil)
				and Duel.IsExistingTarget(c80100051.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp)
		else
			e:SetLabel(1)
			return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
				and Duel.IsExistingTarget(Card.IsDestructable,tp,LOCATION_MZONE,0,1,nil)
				and Duel.IsExistingTarget(c80100051.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp)
		end
	end
	
	local g1
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	if (e:GetLabel()==0) then
		g1=Duel.SelectTarget(tp,Card.IsDestructable,tp,LOCATION_ONFIELD,0,1,1,nil)
	else
		g1=Duel.SelectTarget(tp,Card.IsDestructable,tp,LOCATION_MZONE,0,1,1,nil)
	end
	
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g2=Duel.SelectTarget(tp,c80100051.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g1,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g2,1,0,0)
	e:SetLabelObject(g1:GetFirst())
end
function c80100051.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc1,tc2=Duel.GetFirstTarget()
	if tc1~=e:GetLabelObject() then tc1,tc2=tc2,tc1 end
	if tc1:IsControler(tp) and tc1:IsRelateToEffect(e) and Duel.Destroy(tc1,REASON_EFFECT)>0 and tc2:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc2,0,tp,tp,false,false,POS_FACEUP)
	end
end
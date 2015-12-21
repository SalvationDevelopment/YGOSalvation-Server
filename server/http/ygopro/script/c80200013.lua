--ＤＤリクルート
function c80200013.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,80200013)
	e1:SetCondition(c80200013.condition)
	e1:SetTarget(c80200013.target)
	e1:SetOperation(c80200013.activate)
	c:RegisterEffect(e1)
end
function c80200013.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)>Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)
end
function c80200013.filter(c)
	return (c:IsSetCard(0xae) or c:IsSetCard(0xaf) and c:IsType(TYPE_MONSTER)) and c:IsAbleToHand()
end
function c80200013.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetControler()==tp and chkc:GetLocation()==LOCATION_GRAVE and c80200013.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80200013.filter,tp,LOCATION_GRAVE,0,1,nil) end
	local ct1=Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)
	local ct2=Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c80200013.filter,tp,LOCATION_GRAVE,0,1,ct2-ct1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,g:GetCount(),0,0)
end
function c80200013.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=g:Filter(Card.IsRelateToEffect,nil,e)
	if sg:GetCount()>0 then
		Duel.SendtoHand(sg,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,sg)
	end
end

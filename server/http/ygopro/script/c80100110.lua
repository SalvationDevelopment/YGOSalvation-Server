--影霊衣の術士 シュリット
function c80100110.initial_effect(c)
	--ritual level
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_RITUAL_LEVEL)
	e1:SetValue(c80100110.rlevel)
	c:RegisterEffect(e1)
	--search
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100110,0))
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_RELEASE)
	e2:SetCountLimit(1,80100110)
	e2:SetCondition(c80100110.con)
	e2:SetTarget(c80100110.target)
	e2:SetOperation(c80100110.operation)
	c:RegisterEffect(e2)
end
function c80100110.rlevel(e,c)
	local lv=e:GetHandler():GetLevel()
	if c:IsSetCard(0xb4) then
		local clv=c:GetLevel()
		return lv*65536+clv
	else return lv end
end
function c80100110.con(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsReason(REASON_EFFECT)
end
function c80100110.filter(c)
	return c:IsSetCard(0xb4) and c:IsRace(RACE_WARRIOR) and c:IsType(TYPE_RITUAL) and c:IsAbleToHand()
end
function c80100110.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingMatchingCard(c80100110.filter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80100110.operation(e,tp,eg,ep,ev,re,r,rp,chk)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80100110.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
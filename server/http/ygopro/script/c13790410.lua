--Kentarus
function c13790410.initial_effect(c)
	--atk/def up
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e1:SetCountLimit(1)
	e1:SetCondition(c13790410.condition)
	e1:SetTarget(c13790410.target)
	e1:SetOperation(c13790410.operation)
	c:RegisterEffect(e1)
end
function c13790410.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetAttackTarget()~=nil
end
function c13790410.tgfilter(c)
	return c:IsRace(RACE_BEASTWARRIOR+RACE_BEAST+RACE_WINDBEAST) and c:IsType(TYPE_MONSTER) and c:IsAbleToGrave()
end
function c13790410.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790410.tgfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK+LOCATION_HAND)
end
function c13790410.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c13790410.tgfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,1,nil)
	local tc=g:GetFirst()
	if tc and Duel.SendtoGrave(tc,REASON_EFFECT)~=0 and c:IsRelateToBattle() and c:IsFaceup() then
		local lv=tc:GetLevel()
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(lv*100)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
		c:RegisterEffect(e1)
	end
end

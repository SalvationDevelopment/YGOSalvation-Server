--Legion the Fiend Jester
function c13790585.initial_effect(c)
	--extra summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_HAND+LOCATION_MZONE,0)
	e1:SetCode(EFFECT_EXTRA_SUMMON_COUNT)
	e1:SetTarget(c13790585.extg)
	c:RegisterEffect(e1)
	--tohand
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOHAND)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCountLimit(1,13790585)
	e2:SetCondition(c13790585.condition)
	e2:SetTarget(c13790585.target)
	e2:SetOperation(c13790585.operation)
	c:RegisterEffect(e2)
end
function c13790585.extg(e,c)
	return c:IsLevelAbove(5) and c:IsRace(RACE_SPELLCASTER)
end
function c13790585.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c13790585.filter(c)
	return c:IsType(TYPE_NORMAL) and c:IsRace(RACE_SPELLCASTER) and c:IsAbleToHand()
end
function c13790585.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE+LOCATION_DECK) and chkc:IsControler(tp) and c13790585.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790585.filter,tp,LOCATION_GRAVE+LOCATION_DECK,0,1,nil) end
end
function c13790585.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13790585.filter,tp,LOCATION_GRAVE+LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

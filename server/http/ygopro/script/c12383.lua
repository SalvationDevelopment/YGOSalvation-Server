--Vampire Bat
function c12383.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetTarget(c12383.tg1)
	e1:SetValue(200)
	c:RegisterEffect(e1)
	--Destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetTarget(c12383.desreptg)
	c:RegisterEffect(e2)
end
function c12383.tg1(e,c)
	return c:IsRace(RACE_ZOMBIE)
end

function c12383.repfilter(c)
	return c:IsCode(12383) and c:IsAbleToGrave()
end
function c12383.desreptg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return not c:IsReason(REASON_REPLACE) 
		and Duel.IsExistingMatchingCard(c12383.repfilter,tp,LOCATION_DECK,0,1,nil) end
	if Duel.SelectYesNo(tp,aux.Stringid(12383,0)) then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local g=Duel.SelectMatchingCard(tp,c12383.repfilter,tp,LOCATION_DECK,0,1,1,nil)
		Duel.SendtoGrave(g,REASON_COST)
		return true
	else return false end
end
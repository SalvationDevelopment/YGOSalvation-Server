--Shining Evolution
function c202.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetCost(c202.cost)
	e1:SetTarget(c202.target)
	e1:SetOperation(c202.activate)
	c:RegisterEffect(e1)
end
function c202.costfilter(c)
	return c:IsFaceup() and c:IsCode(23995346) and c:IsAbleToGraveAsCost()
end
function c202.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c202.costfilter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c202.costfilter,tp,LOCATION_SZONE,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_COST)
end
function c202.filter(c,e,tp)
	local code=c:GetCode()
	return (code==53347303) and c:IsCanBeSpecialSummoned(e,0,tp,true,true) and not c:IsHasEffect(EFFECT_NECRO_VALLEY)
end

function c202.filter2(c,e,tp)
	local code=c:GetCode()
	return c:IsFaceup() and c:IsCode(53347303)
end
	
function c202.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c202.filter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND)
end
function c202.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c202.filter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,true,true,POS_FACEUP)
	end
	local g=Duel.SelectMatchingCard(tp,c202.filter2,tp,LOCATION_MZONE,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		c:g
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE+EFFECT_FLAG_OWNER_RELATE)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetCondition(c202.rcon)
		e1:SetValue(1)
		tc:RegisterEffect(e1,true)
		local e2=e1:Clone()
		e2:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
		e2:SetValue(c202.efilter)
		tc:RegisterEffect(e2,true)
		local e3=e2:Clone()
		e3:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
		tc:RegisterEffect(e3,true)
	end
	
end

function c202.rcon(e)
	return e:GetOwner():IsHasCardTarget(e:GetHandler())
end
function c202.acon(e)
	return e:GetOwner():IsHasCardTarget(e:GetHandler()) and e:GetHandlerPlayer()==e:GetLabel()
end
function c202.efilter(e,re)
	return e:GetOwnerPlayer()~=re:GetOwnerPlayer()
end

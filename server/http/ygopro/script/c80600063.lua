--鏡鳴する武神
function c80600063.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80600063.condition)
	e1:SetOperation(c80600063.operation)
	c:RegisterEffect(e1)
end
function c80600063.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x88) and c:IsRace(RACE_BEASTWARRIOR)
end
function c80600063.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80600063.cfilter,tp,LOCATION_MZONE,0,1,nil)
	and Duel.GetMatchingGroupCount(nil,tp,LOCATION_MZONE,0,nil)<Duel.GetMatchingGroupCount(nil,tp,0,LOCATION_MZONE,nil)
end
function c80600063.operation(e,tp,eg,ep,ev,re,r,rp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_CANNOT_ACTIVATE)
	e1:SetTargetRange(1,1)
	e1:SetValue(c80600063.aclimit)
	e1:SetReset(RESET_PHASE+PHASE_END,2)
	Duel.RegisterEffect(e1,tp)
end
function c80600063.aclimit(e,re,tp)
	return re:GetHandler():IsType(TYPE_SPELL+TYPE_TRAP) and re:IsHasType(EFFECT_TYPE_ACTIVATE)
end

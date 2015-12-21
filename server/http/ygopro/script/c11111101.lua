--Altar of The Bound Deity
function c11111101.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetHintTiming(TIMING_STANDBY_PHASE,TIMING_END_PHASE+TIMING_EQUIP)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--Add Counter
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_COUNTER)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e2:SetProperty(EFFECT_FLAG_REPEAT)
	e2:SetCountLimit(1)
	e2:SetCondition(c11111101.condition)
	e2:SetOperation(c11111101.operation)
	c:RegisterEffect(e2)
end
function c11111101.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end


function c11111101.drfilter(c)
	return c:IsPosition(POS_FACEUP_DEFENCE)
end

function c11111101.operation(e,tp,eg,ep,ev,re,r,rp)
	local ct=Duel.GetMatchingGroupCount(c11111101.drfilter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	if ct>0 then
		e:GetHandler():AddCounter(0x01a,ct)
	end
end


--Ä§Œ§ª• ¥±¥ë¥Ù¥í¥¹
function c1018.initial_effect(c)
	c:EnableCounterPermit(0x3001)
	--add counter
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e1:SetCode(EVENT_CHAIN_SOLVING)
	e1:SetProperty(EFFECT_FLAG_DELAY)
	e1:SetRange(LOCATION_MZONE)
	e1:SetOperation(c1018.acop)
	c:RegisterEffect(e1)
	--attackup
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_UPDATE_ATTACK)
	e2:SetValue(c1018.attackup)
	c:RegisterEffect(e2)
	--remove counter
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_PHASE+PHASE_BATTLE)
	e3:SetCountLimit(1)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c1018.condition)
	e3:SetOperation(c1018.operation)
	c:RegisterEffect(e3)
end
function c1018.acop(e,tp,eg,ep,ev,re,r,rp)
	if re:IsHasType(EFFECT_TYPE_ACTIVATE) and re:IsActiveType(TYPE_SPELL) then
		e:GetHandler():AddCounter(0x3001,1)
	end
end
function c1018.attackup(e,c)
	return c:GetCounter(0x3001)*500
end
function c1018.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetBattledGroupCount()>0
end
function c1018.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local n=c:GetCounter(0x3001)
	if n~=0 then c:RemoveCounter(tp,0x3001,n,REASON_EFFECT) end
end

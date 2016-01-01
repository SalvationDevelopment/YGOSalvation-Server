--Amorphage Cavum
--By: HelixReactor
function c72001829.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--Maintenance cost
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_RELEASE+CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e2:SetRange(LOCATION_PZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c72001829.descon)
	e2:SetOperation(c72001829.desop)
	c:RegisterEffect(e2)
	--Chain Limit
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_CHAINING)
	e3:SetRange(LOCATION_PZONE)
	e3:SetCondition(c72001829.chaincon)
	e3:SetOperation(c72001829.chainop)
	c:RegisterEffect(e3)
	--SP Limit
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e4:SetCode(EVENT_FLIP)
	e4:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e4:SetOperation(c72001829.flagop)
	c:RegisterEffect(e4)
	local e5=e4:Clone()
	e5:SetCode(EVENT_SPSUMMON_SUCCESS)
	e5:SetCondition(c72001829.flagcon)
	c:RegisterEffect(e5)
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_FIELD)
	e6:SetRange(LOCATION_MZONE)
	e6:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e6:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e6:SetTargetRange(1,1)
	e6:SetCondition(c72001829.spcon)
	e6:SetTarget(c72001829.splimit)
	c:RegisterEffect(e6)
end
function c72001829.descon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c72001829.desop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local con=Duel.CheckReleaseGroup(tp,nil,1,nil)
	local op=false
	if con then op=Duel.SelectYesNo(tp,aux.Stringid(72001829,0)) end
	if op then
		local g=Duel.SelectReleaseGroup(tp,Card.IsReleasableByEffect,1,1,nil)
		Duel.Release(g,REASON_EFFECT)
	else
		Duel.Destroy(c,REASON_EFFECT)
	end
end
function c72001829.chainfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_MONSTER) and c:IsSetCard(0x1d1)
end
function c72001829.chaincon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c72001829.chainfilter,tp,LOCATION_ONFIELD,0,1,nil)
end
function c72001829.chainop(e,tp,eg,ep,ev,re,r,rp)
	Duel.SetChainLimit(aux.FALSE)
end
function c72001829.flagcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_PENDULUM
end
function c72001829.flagop(e,tp,eg,ep,ev,re,r,rp)
	e:GetHandler():RegisterFlagEffect(72001829,RESET_EVENT+0x1fe0000,0,1)
end
function c72001829.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetFlagEffect(72001829)~=0
end
function c72001829.splimit(e,c,sump,sumtype,sumpos,targetp)
	return c:IsLocation(LOCATION_EXTRA) and not c:IsSetCard(0x1d1)
end
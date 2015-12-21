--Barrier Bubble--Script by DailyShana
function c13790524.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--avoid battle damage
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_AVOID_BATTLE_DAMAGE)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTargetRange(LOCATION_MZONE,0)
	e2:SetTarget(c13790524.target)
	e2:SetValue(1)
	c:RegisterEffect(e2)
	--indes
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(15580)
	e3:SetRange(LOCATION_SZONE)
	e3:SetTargetRange(LOCATION_MZONE,0)
	e3:SetTarget(c13790524.target)
	c:RegisterEffect(e3)
	if not c13790524.global_check then
		c13790524.global_check=true
		local ex=Effect.CreateEffect(c)
		ex:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ex:SetCode(EVENT_ADJUST)
		ex:SetOperation(c13790524.regop)
		Duel.RegisterEffect(ex,0)
	end
end
function c13790524.target(e,c)
	return c:IsSetCard(0xc7) or c:IsSetCard(0x9f)
end
function c13790524.regfilter(c)
	return (c:IsSetCard(0xc7) or c:IsSetCard(0x9f)) and c:GetFlagEffect(15580)==0
end
function c13790524.regop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(0,LOCATION_MZONE,LOCATION_MZONE):Filter(c13790524.regfilter,nil)
	if g:GetCount()==0 then return end
	local tc=g:GetFirst()
	while tc do
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCode(EFFECT_INDESTRUCTABLE_COUNT)
		e1:SetCountLimit(1)
		e1:SetValue(c13790524.valcon)
		tc:RegisterEffect(e1)
		tc:RegisterFlagEffect(15580,0,0,1)
		tc=g:GetNext()
	end
	Duel.Readjust()
end
function c13790524.valcon(e,re,r,rp)
	return e:GetHandler():IsHasEffect(15580) and bit.band(r,REASON_BATTLE+REASON_EFFECT)~=0
end

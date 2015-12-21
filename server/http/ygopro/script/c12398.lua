--Orichalcos Ariesteros
function c12398.initial_effect(c)
	c:EnableReviveLimit()
	--cannot special summon
	local e0=Effect.CreateEffect(c)
	e0:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e0:SetType(EFFECT_TYPE_SINGLE)
	e0:SetCode(EFFECT_SPSUMMON_CONDITION)
	e0:SetValue(aux.FALSE)
	c:RegisterEffect(e0)
	--attack up
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e1:SetOperation(c12398.atkop)
	c:RegisterEffect(e1)
	--selfdestroy
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_SELF_DESTROY)
	e2:SetCondition(c12398.descon)
	c:RegisterEffect(e2)	
end

function c12398.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tg=c:GetBattleTarget()
	if tg then
		local atk=tg:GetAttack()
		if atk>0 then
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_UPDATE_ATTACK)
			e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
			e1:SetValue(atk)
			c:RegisterEffect(e1)
		end
	end
end

function c12398.desfilter(c)
	return c:IsCode(12399)
end

function c12398.descon(e)
	return not Duel.IsExistingMatchingCard(c12398.desfilter,e:GetHandler():GetControler(),LOCATION_MZONE,0,1,nil)
end
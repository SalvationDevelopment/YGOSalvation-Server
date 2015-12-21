--Orichalcos Dexia
function c123100.initial_effect(c)
	c:EnableReviveLimit()
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(aux.FALSE)
	c:RegisterEffect(e1)
	--defence up
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DEFCHANGE)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e2:SetOperation(c123100.defop)
	c:RegisterEffect(e2)
	--selfdestroy
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_SELF_DESTROY)
	e3:SetCondition(c123100.descon)
	c:RegisterEffect(e3)	
end

function c123100.defop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tg=c:GetBattleTarget()
	if tg then
		local def=tg:GetAttack()
		if def>0 then
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_UPDATE_DEFENCE)
			e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
			e1:SetValue(def)
			c:RegisterEffect(e1)
		end
	end
end

function c123100.desfilter(c)
	return c:IsCode(12399)
end

function c123100.descon(e)
	return not Duel.IsExistingMatchingCard(c123100.desfilter,e:GetHandler():GetControler(),LOCATION_MZONE,0,1,nil)
end

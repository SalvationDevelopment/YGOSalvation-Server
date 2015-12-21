--By Jackmoonward 1/18/2015
--Number S39 Utopia the Lightning

function c10820001.initial_effect(c)
	--Xyz summon
	aux.AddXyzProcedure(c,aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_LIGHT),5,3,c10820001.ovfilter,aux.Stringid(10820001,1))
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_CANNOT_BE_XYZ_MATERIAL)
	e1:SetValue(1)
	c:RegisterEffect(e1)
	--Armadeus
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetCode(EFFECT_CANNOT_ACTIVATE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTargetRange(0,1)
	e2:SetValue(c10820001.aclimit)
	e2:SetCondition(c10820001.actcon)
	c:RegisterEffect(e2)
	--5000 ATK
	local e3=Effect.CreateEffect(c)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetRange(LOCATION_MZONE)
	e3:SetHintTiming(TIMING_DAMAGE_CAL)
	e3:SetCost(c10820001.cost)
	e3:SetCondition(c10820001.con)
	e3:SetOperation(c10820001.op)
	c:RegisterEffect(e3)
end
	function c10820001.ovfilter(c)
	return c:IsFaceup() and c:GetRank()==5 and c:IsSetCard(0x7f)
	end
function c10820001.aclimit(e,re,tp)
	return not re:GetHandler():IsImmuneToEffect(e)
end
function c10820001.actcon(e)
	return Duel.GetAttacker()==e:GetHandler() or Duel.GetAttackTarget()==e:GetHandler()
end
function c10820001.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c10820001.con(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetOverlayGroup():IsExists(Card.IsSetCard,1,nil,0x7f)
	and e:GetLabel()~=1 and e:GetHandler()==Duel.GetAttacker() and e:GetHandler():GetBattleTarget()~=nil
	or e:GetHandler():GetOverlayGroup():IsExists(Card.IsSetCard,1,nil,0x7f)
	and e:GetLabel()~=1 and e:GetHandler()==Duel.GetAttackTarget() and e:GetHandler():GetBattleTarget()~=nil
end
function c10820001.op(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SET_ATTACK_FINAL)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_DAMAGE_CAL)
	e1:SetValue(5000)
	c:RegisterEffect(e1)
	end
end
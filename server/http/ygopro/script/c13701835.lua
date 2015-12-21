--Number 38: Titanic Calaxy
function c13701835.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,8,2)
	c:EnableReviveLimit()
	--Disable Spell
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_CHAINING)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c13701835.condition)
	e1:SetTarget(c13701835.target)
	e1:SetOperation(c13701835.operation)
	c:RegisterEffect(e1)
	--change target
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(91499077,1))
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCost(c13701835.cbcost)
	e2:SetCondition(c13701835.cbcon)
	e2:SetOperation(c13701835.cbop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_ATKCHANGE)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_DESTROYED)
	e3:SetRange(LOCATION_MZONE)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e3:SetTarget(c13701835.atktg2)
	e3:SetOperation(c13701835.atkop2)
	c:RegisterEffect(e3)
end
function c13701835.condition(e,tp,eg,ep,ev,re,r,rp)
	return re:GetHandler():IsOnField() and ((re:IsActiveType(TYPE_SPELL) and not re:IsHasType(EFFECT_TYPE_ACTIVATE)))
end
function c13701835.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return re:GetHandler():IsDestructable() end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
end
function c13701835.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Overlay(e:GetHandler(),eg)
	end
end


function c13701835.cbcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c13701835.cbcon(e,tp,eg,ep,ev,re,r,rp)
	local bt=eg:GetFirst()
	return r~=REASON_REPLACE and bt~=e:GetHandler() and bt:IsControler(tp)
end
function c13701835.cbop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) then
		local at=Duel.GetAttacker()
		if at:IsAttackable() and not at:IsImmuneToEffect(e) and not c:IsImmuneToEffect(e) then
			Duel.CalculateDamage(at,c)
		end
	end
end


function c13701835.filter1(c,e,tp)
	return c:IsFaceup() and c:IsType(TYPE_XYZ)
end
function c13701835.filter2(c,e,tp)
	return c:IsReason(REASON_BATTLE+REASON_EFFECT) and c:IsType(TYPE_XYZ)
		and c:IsPreviousLocation(LOCATION_MZONE) and c:GetPreviousControler()==tp
		and c:IsLocation(LOCATION_GRAVE+LOCATION_REMOVED) and c:IsCanBeEffectTarget(e)
end
function c13701835.atktg2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return eg:IsContains(chkc) and c13701835.filter2(chkc,e,tp) end
	if chk==0 then return eg:IsExists(c13701835.filter2,1,nil,e,tp) and eg:GetCount()==1 end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c13701835.filter1,tp,LOCATION_MZONE,0,1,1,nil)
end
function c13701835.atkop2(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsFaceup() and tc:IsRelateToEffect(e) then
	local g=eg:FilterSelect(tp,c13701835.filter2,1,1,nil,e,tp)
	local atk=g:GetFirst():GetBaseAttack()
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(atk)
		e1:SetReset(RESET_EVENT+0x1ff0000)
		tc:RegisterEffect(e1)
	end
end

--Tyrant Wing
function c13720007.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_DAMAGE_STEP)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCondition(c13720007.condition)
	e1:SetTarget(c13720007.target)
	e1:SetOperation(c13720007.operation)
	c:RegisterEffect(e1)
end
function c13720007.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()~=PHASE_DAMAGE or not Duel.IsDamageCalculated()
end
function c13720007.filter(c)
	return c:IsFaceup() and c:IsRace(RACE_DRAGON)
end
function c13720007.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) and c13720007.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13720007.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	local g=Duel.SelectTarget(tp,c13720007.filter,tp,LOCATION_MZONE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,e:GetHandler(),1,0,0)
end
function c13720007.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not c:IsLocation(LOCATION_SZONE) then return end
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.Equip(tp,c,tc)
		c:CancelToGrave()
		--draw
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_EQUIP)
		e1:SetCode(EFFECT_EXTRA_ATTACK)
		e1:SetValue(1)
		e1:SetReset(RESET_EVENT+0x1ff0000)
		c:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_EQUIP)
		e2:SetCode(EFFECT_CANNOT_DIRECT_ATTACK)
		e2:SetReset(RESET_EVENT+0x1ff0000)
		e2:SetCondition(c13720007.dircon)
		c:RegisterEffect(e2)
		local e6=e2:Clone()
		e6:SetCode(EFFECT_CANNOT_ATTACK)
		e6:SetCondition(c13720007.dircon2)
		c:RegisterEffect(e6)
		local e4=Effect.CreateEffect(c)
		e4:SetType(EFFECT_TYPE_SINGLE)
		e4:SetCode(EFFECT_UPDATE_ATTACK)
		e4:SetValue(400)
		e4:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e4)
		local e5=Effect.CreateEffect(c)
		e5:SetType(EFFECT_TYPE_SINGLE)
		e5:SetCode(EFFECT_UPDATE_DEFENCE)
		e5:SetValue(400)
		e5:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e5)
		--Equip limit
		local e6=Effect.CreateEffect(c)
		e6:SetType(EFFECT_TYPE_SINGLE)
		e6:SetCode(EFFECT_EQUIP_LIMIT)
		e6:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e6:SetValue(c13720007.eqlimit)
		e6:SetReset(RESET_EVENT+0x1fe0000)
		c:RegisterEffect(e6)
		local e7=Effect.CreateEffect(c)
		e7:SetCategory(CATEGORY_DESTROY)
		e7:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
		e7:SetProperty(EFFECT_FLAG_CARD_TARGET)
		e7:SetCode(EVENT_BATTLED)
		e7:SetCondition(c13720007.descon)
		e7:SetOperation(c13720007.desop)
		tc:RegisterEffect(e7)
		local e8=Effect.CreateEffect(c)
		e8:SetType(EFFECT_TYPE_SINGLE)
		e8:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
		e8:SetRange(LOCATION_SZONE)
		e8:SetCode(EFFECT_SELF_DESTROY)
		e8:SetCondition(c13720007.sdcondition)
		c:RegisterEffect(e8)
	end
end
function c13720007.eqlimit(e,c)
	return c:IsRace(RACE_DRAGON)
end
function c13720007.dircon(e)
	return e:GetHandler():GetAttackAnnouncedCount()>0
end
function c13720007.dircon2(e)
	return e:GetHandler():IsDirectAttacked()
end

function c13720007.descon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetAttackTarget()~=nil
end
function c13720007.desop(e,tp,eg,ep,ev,re,r,rp)
	e:GetHandler():RegisterFlagEffect(13720007,RESET_EVENT+0x1ec0000+RESET_PHASE+PHASE_END,0,1)
end

function c13720007.sdcondition(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetHandler():GetEquipTarget()
	return tc and tc:GetFlagEffect(13720007)~=0 and Duel.GetCurrentPhase()==PHASE_END
end

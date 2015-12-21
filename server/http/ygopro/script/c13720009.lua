--Time Magic Hammer
--CHANGED TO REMOVE
function c13720009.initial_effect(c)
	c:EnableReviveLimit()
    --cannot spsummon
	local es=Effect.CreateEffect(c)
	es:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	es:SetType(EFFECT_TYPE_SINGLE)
	es:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(es)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetTarget(c13720009.eqtg)
	e1:SetOperation(c13720009.eqop)
	c:RegisterEffect(e1)
end
function c13720009.eqtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsFaceup() and chkc~=e:GetHandler() end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	local g=Duel.SelectTarget(tp,Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,g,1,0,0)
end
function c13720009.eqop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	if not tc:IsRelateToEffect(e) or tc:IsFacedown() then
		Duel.SendtoGrave(c,REASON_EFFECT)
		return
	end
	if not Duel.Equip(tp,c,tc,false) then return end
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetCategory(CATEGORY_DESTROY)
	e4:SetCode(EVENT_BATTLE_START)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCondition(c13720009.descon)
	e4:SetTarget(c13720009.destg)
	e4:SetOperation(c13720009.desop)
	c:RegisterEffect(e4)
	--eqlimit
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_EQUIP_LIMIT)
	e4:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e4:SetValue(c13720009.eqlimit)
	e4:SetReset(RESET_EVENT+0x1fe0000)
	e4:SetLabelObject(tc)
	c:RegisterEffect(e4)
end
function c13720009.eqlimit(e,c)
	return c==e:GetLabelObject()
end

function c13720009.descon(e,tp,eg,ep,ev,re,r,rp)
	local tg=e:GetHandler():GetEquipTarget()
	return tg and (Duel.GetAttacker()==tg or Duel.GetAttackTarget()==tg)
end
function c13720009.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	local tc=c:GetEquipTarget():GetBattleTarget()
	if chk==0 then return tc and tc:IsControler(1-tp) end
	local g=Group.FromCards(tc,c)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,g:GetCount(),0,0)
end
function c13720009.desop(e,tp,eg,ep,ev,re,r,rp)
	local eqc=e:GetHandler():GetEquipTarget()
	local tc=eqc:GetBattleTarget()
	local c=e:GetHandler() 
	local dc=Duel.TossDice(tp,1) 
	if c:IsRelateToEffect(e) and c:IsFaceup() and Duel.Remove(tc,tc:GetPosition(),REASON_EFFECT+REASON_TEMPORARY)~=0 then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_PHASE+PHASE_STANDBY)
		e1:SetCountLimit(1)
		e1:SetOperation(c13720009.retop)
		e1:SetLabel(dc)
		e1:SetLabelObject(tc)
		e1:SetReset(RESET_PHASE+PHASE_STANDBY+RESET_SELF_TURN,dc)
		Duel.RegisterEffect(e1,tp)
	end
end
function c13720009.retop(e,tp,eg,ep,ev,re,r,rp)
	local ct=e:GetLabel()
	ct=ct-1
	e:SetLabel(ct)
	if ct==0 then Duel.ReturnToField(e:GetLabelObject()) end
end

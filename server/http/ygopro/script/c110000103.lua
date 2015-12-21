--Active Guard
function c110000103.initial_effect(c)
	--defup
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetCode(EFFECT_UPDATE_DEFENCE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetValue(c110000103.val)
	c:RegisterEffect(e1)
	--Activate
    local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(110000103,0))
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetCode(EVENT_PRE_BATTLE_DAMAGE)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_MZONE)
	e2:SetOperation(c110000103.foperation)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_CHANGE_DAMAGE)
	c:RegisterEffect(e3)
	--destroy
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(110000103,0))
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e4:SetProperty(EFFECT_FLAG_REPEAT)
	e4:SetCode(EVENT_PHASE+PHASE_END)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCountLimit(1)
	e4:SetCondition(c110000103.sdescon)
	e4:SetTarget(c110000103.sdestg)
	e4:SetOperation(c110000103.sdesop)
	c:RegisterEffect(e4)
	--Restrict Attack
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e5:SetCode(EVENT_ATTACK_ANNOUNCE)
	e5:SetCondition(c110000103.racon)
	e5:SetOperation(c110000103.raop)
	c:RegisterEffect(e5)
    --Attack Redirection
    local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e6:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e6:SetCode(EVENT_BE_BATTLE_TARGET)
	e6:SetCondition(c110000103.arcon)
	e6:SetTarget(c110000103.artar)
	e6:SetOperation(c110000103.arop)
	c:RegisterEffect(e6)
end
function c110000103.val(e,c)
return Duel.GetMatchingGroupCount(c110000103.filter,c:GetControler(),LOCATION_MZONE,0,e:GetHandler())*500
end
function c110000103.filter(c)
return c:IsFaceup() and c:IsSetCard(0x3A2E)
end
function c110000103.foperation(e,tp,eg,ep,ev,re,r,rp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CHANGE_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(1,0)
	e1:SetValue(0)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
	e:GetHandler():RegisterFlagEffect(110000103,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	end
function c110000103.sdescon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetFlagEffect(110000103)~=0
end
function c110000103.sdestg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,e:GetHandler(),1,0,0)
end
function c110000103.sdesop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		Duel.Destroy(c,REASON_EFFECT)
		end
		end
function c110000103.filter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000103.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
end
function c110000103.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000103.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(c110000103.filter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000103.filter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000103.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000103.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000103.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000103.atkfilter)
	j:RegisterEffect(e9)
end